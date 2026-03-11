from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

class EventType(str, Enum):
    GAME_STARTED = "game_started"
    QUESTION_ANSWERED = "question_answered"
    GAME_FINISHED = "game_finished"
    DOCUMENT_UPLOADED = "document_uploaded"
    QUESTION_GENERATED = "question_generated"

class EventIn(BaseModel):
    event_id: UUID = Field(default_factory=uuid4)
    event_type: EventType
    timestamp: datetime
    user_id: str
    game_id: Optional[str] = None
    session_id: Optional[str] = None
    mode: Optional[str] = Field(default=None, description="solo|group")
    payload: Dict[str, Any] = Field(default_factory=dict)