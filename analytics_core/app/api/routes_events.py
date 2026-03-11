from fastapi import APIRouter, status
from app.schemas.event import EventIn
from app.services.ingestion_service import ingest_event, ingest_events_batch

router = APIRouter()

@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
def post_event(event: EventIn):
    ingest_event(event)
    return {"status": "accepted", "event_id": str(event.event_id)}

@router.post("/events/batch", status_code=status.HTTP_202_ACCEPTED)
def post_events_batch(events: list[EventIn]):
    accepted = ingest_events_batch(events)
    return {"status": "accepted", "count": accepted}