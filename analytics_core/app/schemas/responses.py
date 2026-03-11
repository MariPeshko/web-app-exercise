from typing import List
from pydantic import BaseModel

class KpiResponse(BaseModel):
    games_played: int
    avg_score: float
    best_score: int
    avg_answer_time_ms: float
    active_users: int

class TimePoint(BaseModel):
    timestamp: str
    value: float

class TimeseriesResponse(BaseModel):
    metric: str
    interval: str
    points: List[TimePoint]