from datetime import datetime
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from app.api.deps import validate_date_range
from app.core.auth import require_admin
from app.services.export_service import export_csv, export_pdf

router = APIRouter()

@router.get("/export.csv", dependencies=[Depends(require_admin)])
def export_csv_route(
    from_: datetime = Query(alias="from"),
    to: datetime = Query(...),
    mode: str | None = None,
    user_id: str | None = None,
):
    validate_date_range(from_, to)
    stream = export_csv(from_, to, mode=mode, user_id=user_id)
    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=analytics_export.csv"},
    )

@router.get("/export.pdf", dependencies=[Depends(require_admin)])
def export_pdf_route(
    from_: datetime = Query(alias="from"),
    to: datetime = Query(...),
):
    validate_date_range(from_, to)
    stream = export_pdf(from_, to)
    return StreamingResponse(
        stream,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=analytics_report.pdf"},
    )