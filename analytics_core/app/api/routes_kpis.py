from datetime import datetime
from fastapi import APIRouter, Depends, Query

from app.api.deps import validate_date_range
from app.core.auth import require_admin
from app.services.aggregation_service import get_kpis

router = APIRouter()

@router.get("/kpis", dependencies=[Depends(require_admin)])
def kpis(
    from_: datetime = Query(alias="from"),
    to: datetime = Query(...),
    mode: str | None = None,
    user_id: str | None = None,
):
    validate_date_range(from_, to)
    return get_kpis(from_, to, mode=mode, user_id=user_id)