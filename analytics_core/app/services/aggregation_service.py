from datetime import datetime
from fastapi import HTTPException, status
from app.db.repository import get_kpis as repo_get_kpis
from app.db.repository import get_timeseries as repo_get_timeseries


def _session_local():
    # Lazy import prevents DB driver errors during app import-time.
    from app.db.session import SessionLocal

    return SessionLocal


def get_kpis(from_: datetime, to: datetime, mode: str | None = None, user_id: str | None = None):
    db = _session_local()()
    try:
        return repo_get_kpis(db, from_, to, mode=mode, user_id=user_id)
    finally:
        db.close()

def get_timeseries(
    metric: str,
    interval: str,
    from_: datetime,
    to: datetime,
    mode: str | None = None,
    user_id: str | None = None,
):
    db = _session_local()()
    try:
        return repo_get_timeseries(
            db=db,
            metric=metric,
            interval=interval,
            from_=from_,
            to=to,
            mode=mode,
            user_id=user_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    finally:
        db.close()