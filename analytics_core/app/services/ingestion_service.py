from app.db.repository import save_event, save_events_batch
from app.schemas.event import EventIn
from app.services.realtime_service import publish_realtime_update


def _session_local():
    # Lazy import prevents DB driver errors during app import-time.
    from app.db.session import SessionLocal

    return SessionLocal


def ingest_event(event: EventIn) -> None:
    db = _session_local()()
    try:
        save_event(db, event)
        publish_realtime_update(
            {
                "type": "event_ingested",
                "event_type": event.event_type.value,
                "event_id": str(event.event_id),
                "timestamp": event.timestamp.isoformat(),
                "user_id": event.user_id,
            }
        )
    finally:
        db.close()

def ingest_events_batch(events: list[EventIn]) -> int:
    db = _session_local()()
    try:
        accepted = save_events_batch(db, events)
        publish_realtime_update(
            {
                "type": "batch_ingested",
                "count": accepted,
            }
        )
        return accepted
    finally:
        db.close()