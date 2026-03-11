from datetime import datetime
from fastapi import HTTPException, status

def validate_date_range(from_: datetime, to: datetime) -> None:
    if from_ >= to:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="'from' must be earlier than 'to'",
        )