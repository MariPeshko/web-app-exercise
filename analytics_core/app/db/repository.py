from datetime import date, datetime, timedelta
from typing import Any
from sqlalchemy import Integer, and_, case, cast, Date, Float, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
from app.db.models import AnalyticsEvent, DailyMetric
from app.schemas.event import EventIn


ALLOWED_METRICS = {"games_played", "avg_score", "avg_answer_time_ms"}
ALLOWED_INTERVALS = {"minute", "hour", "day", "week"}


def _payload_number(key: str, to_type):
    # SQLAlchemy 2.x / Postgres-safe JSON text extraction and cast.
    return cast(AnalyticsEvent.payload[key].as_string(), to_type)


def save_event(db: Session, event: EventIn) -> None:
    row = AnalyticsEvent(
        event_id=str(event.event_id),
        event_type=event.event_type.value,
        timestamp=event.timestamp,
        user_id=event.user_id,
        session_id=event.session_id,
        game_id=event.game_id,
        mode=event.mode,
        payload=event.payload,
    )
    db.add(row)
    db.commit()


def save_events_batch(db: Session, events: list[EventIn]) -> int:
    rows = [
        AnalyticsEvent(
            event_id=str(e.event_id),
            event_type=e.event_type.value,
            timestamp=e.timestamp,
            user_id=e.user_id,
            session_id=e.session_id,
            game_id=e.game_id,
            mode=e.mode,
            payload=e.payload,
        )
        for e in events
    ]
    db.add_all(rows)
    db.commit()
    return len(rows)


def _event_filters(from_: datetime, to: datetime, mode: str | None, user_id: str | None):
    filters = [AnalyticsEvent.timestamp >= from_, AnalyticsEvent.timestamp < to]
    if mode:
        filters.append(AnalyticsEvent.mode == mode)
    if user_id:
        filters.append(AnalyticsEvent.user_id == user_id)
    return and_(*filters)


def get_kpis(db: Session, from_: datetime, to: datetime, mode: str | None = None, user_id: str | None = None) -> dict[str, Any]:
    filters = _event_filters(from_, to, mode, user_id)

    games_played = db.scalar(
        select(func.count()).where(filters, AnalyticsEvent.event_type == "game_finished")
    ) or 0

    best_score = db.scalar(
        select(func.max(_payload_number("score", Integer))).where(
            filters, AnalyticsEvent.event_type == "game_finished"
        )
    ) or 0

    avg_score = db.scalar(
        select(func.avg(_payload_number("score", Float))).where(
            filters, AnalyticsEvent.event_type == "game_finished"
        )
    ) or 0.0

    avg_answer_time_ms = db.scalar(
        select(func.avg(_payload_number("answer_time_ms", Float))).where(
            filters, AnalyticsEvent.event_type == "question_answered"
        )
    ) or 0.0

    active_users = db.scalar(
        select(func.count(func.distinct(AnalyticsEvent.user_id))).where(filters)
    ) or 0

    return {
        "games_played": int(games_played),
        "avg_score": float(avg_score),
        "best_score": int(best_score),
        "avg_answer_time_ms": float(avg_answer_time_ms),
        "active_users": int(active_users),
    }


def get_timeseries(
    db: Session,
    metric: str,
    interval: str,
    from_: datetime,
    to: datetime,
    mode: str | None = None,
    user_id: str | None = None,
) -> dict[str, Any]:
    if metric not in ALLOWED_METRICS:
        raise ValueError(f"Unsupported metric: {metric}")
    if interval not in ALLOWED_INTERVALS:
        raise ValueError(f"Unsupported interval: {interval}")

    bucket = func.date_trunc(interval, AnalyticsEvent.timestamp).label("bucket")
    filters = _event_filters(from_, to, mode, user_id)

    if metric == "games_played":
        value_expr = func.count().label("value")
        metric_filter = AnalyticsEvent.event_type == "game_finished"
    elif metric == "avg_score":
        value_expr = func.avg(_payload_number("score", Float)).label("value")
        metric_filter = AnalyticsEvent.event_type == "game_finished"
    else:  # avg_answer_time_ms
        value_expr = func.avg(_payload_number("answer_time_ms", Float)).label("value")
        metric_filter = AnalyticsEvent.event_type == "question_answered"

    rows = db.execute(
        select(bucket, value_expr)
        .where(filters, metric_filter)
        .group_by(bucket)
        .order_by(bucket.asc())
    ).all()

    points = [{"timestamp": r.bucket.isoformat(), "value": float(r.value or 0.0)} for r in rows]
    return {"metric": metric, "interval": interval, "points": points}


def rollup_daily(db: Session, target_day: date) -> int:
    day_start = datetime.combine(target_day, datetime.min.time())
    day_end = day_start + timedelta(days=1)

    # One rollup row per mode (global user_id=None). Keep it simple for v1.
    base_filters = and_(
        AnalyticsEvent.timestamp >= day_start,
        AnalyticsEvent.timestamp < day_end,
    )

    rows = db.execute(
        select(
            cast(AnalyticsEvent.timestamp, Date).label("day"),
            AnalyticsEvent.mode.label("mode"),
            func.count(
                case((AnalyticsEvent.event_type == "game_finished", 1))
            ).label("games_played"),
            func.avg(
                case(
                    (AnalyticsEvent.event_type == "game_finished", _payload_number("score", Float)),
                    else_=None,
                )
            ).label("avg_score"),
            func.max(
                case(
                    (AnalyticsEvent.event_type == "game_finished", _payload_number("score", Integer)),
                    else_=None,
                )
            ).label("best_score"),
            func.avg(
                case(
                    (AnalyticsEvent.event_type == "question_answered", _payload_number("answer_time_ms", Float)),
                    else_=None,
                )
            ).label("avg_answer_time_ms"),
            func.count(func.distinct(AnalyticsEvent.user_id)).label("active_users"),
        )
        .where(base_filters)
        .group_by(cast(AnalyticsEvent.timestamp, Date), AnalyticsEvent.mode)
    ).all()

    upserted = 0
    for r in rows:
        stmt = insert(DailyMetric).values(
            day=r.day,
            mode=r.mode,
            user_id=None,
            games_played=int(r.games_played or 0),
            avg_score=float(r.avg_score or 0.0),
            best_score=int(r.best_score or 0),
            avg_answer_time_ms=float(r.avg_answer_time_ms or 0.0),
            active_users=int(r.active_users or 0),
        )
        stmt = stmt.on_conflict_do_update(
            constraint="uq_daily_metric_scope",
            set_={
                "games_played": stmt.excluded.games_played,
                "avg_score": stmt.excluded.avg_score,
                "best_score": stmt.excluded.best_score,
                "avg_answer_time_ms": stmt.excluded.avg_answer_time_ms,
                "active_users": stmt.excluded.active_users,
            },
        )
        db.execute(stmt)
        upserted += 1

    db.commit()
    return upserted