import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings

_subscribers: set[asyncio.Queue[dict[str, Any]]] = set()

def publish_realtime_update(payload: dict[str, Any]) -> None:
    dead = []
    for queue in _subscribers:
        try:
            queue.put_nowait(payload)
        except Exception:
            dead.append(queue)

    for queue in dead:
        _subscribers.discard(queue)

async def event_generator():
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    _subscribers.add(queue)

    try:
        while True:
            try:
                payload = await asyncio.wait_for(queue.get(), timeout=float(settings.SSE_HEARTBEAT_SECONDS))
                yield {
                    "event": "update",
                    "data": json.dumps(payload),
                }
            except asyncio.TimeoutError:
                # Heartbeat keeps SSE connection alive.
                yield {
                    "event": "heartbeat",
                    "data": json.dumps(
                        {"ts": datetime.now(timezone.utc).isoformat()}
                    ),
                }
    finally:
        _subscribers.discard(queue)