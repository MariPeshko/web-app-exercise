from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

MetricName = Literal["games_played", "avg_score", "avg_answer_time_ms"]
IntervalName = Literal["minute", "hour", "day", "week"]

class AnalyticsFilter(BaseModel):
    from_: datetime = Field(alias="from")
    to: datetime
    mode: Optional[str] = None
    user_id: Optional[str] = None