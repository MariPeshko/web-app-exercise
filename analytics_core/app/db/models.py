from datetime import datetime, date

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    Integer,
    JSON,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    event_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    event_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)

    user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    session_id: Mapped[str | None] = mapped_column(String(128), index=True)
    game_id: Mapped[str | None] = mapped_column(String(128), index=True)
    mode: Mapped[str | None] = mapped_column(String(32), index=True)  # solo/group

    payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class DailyMetric(Base):
    __tablename__ = "analytics_daily_metrics"
    __table_args__ = (
        UniqueConstraint("day", "mode", "user_id", name="uq_daily_metric_scope"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    day: Mapped[date] = mapped_column(Date, index=True, nullable=False)

    mode: Mapped[str | None] = mapped_column(String(32), index=True)
    user_id: Mapped[str | None] = mapped_column(String(128), index=True)

    games_played: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    best_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_answer_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    active_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )