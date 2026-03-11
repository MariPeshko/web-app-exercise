from fastapi import APIRouter, Depends
from app.core.auth import require_admin
from app.services.realtime_service import event_generator

router = APIRouter()

@router.get("/realtime/stream", dependencies=[Depends(require_admin)])
async def realtime_stream():
    from sse_starlette.sse import EventSourceResponse

    return EventSourceResponse(event_generator())