from datetime import datetime
from fastapi import APIRouter, Depends, Query
from app.api.deps import validate_date_range
from app.core.auth import require_admin
from app.services.aggregation_service import get_timeseries

router = APIRouter()

@router.get("/timeseries", dependencies=[Depends(require_admin)])
def timeseries(
    metric: str = Query(..., description="games_played|avg_score|avg_answer_time_ms"),
    interval: str = Query("day", description="minute|hour|day|week"),
    from_: datetime = Query(alias="from"),
    to: datetime = Query(...),
    mode: str | None = None,
    user_id: str | None = None,
):
    validate_date_range(from_, to)
    return get_timeseries(
        metric=metric,
        interval=interval,
        from_=from_,
        to=to,
        mode=mode,
        user_id=user_id,
    )
