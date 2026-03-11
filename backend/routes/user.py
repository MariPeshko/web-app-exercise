from fastapi import APIRouter, Depends, HTTPException
import jwt
import os
from typing import Annotated
from collections import defaultdict

from auth_utils import oauth2_scheme
from database import get_db
from dependencies import get_current_user

# -----------------------------------------------------------------------------
# Constants and Global Instances
# -----------------------------------------------------------------------------

router = APIRouter(prefix="/user", tags=["User"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------


# decodes the JWT that is provided in the request's Authorization header
@router.get("/me")
async def read_users_me(
	token: Annotated[str, Depends(oauth2_scheme)]
):
	try: # Here you use your PyJWT for validation
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return {"user_data": payload}
	except jwt.PyJWTError:
		raise HTTPException(status_code=401, detail="Invalid token")


# def _build_player_stats(user: User, session: Session) -> PlayerStatsResponse:
#     """Aggregate stats for a player from their answer history."""

    # Group answers by game session
    # Average response time (seconds from round start to answer)
            # approximate: round_duration - score gives a rough time
            # but we have answered_at — we can't compare naive/aware easily
            # use score-based estimate: score = max(100, 1000 - elapsed*30) if correct

    # Process each game

        # Determine rank: get all players' scores for this game

        # Streak: >= 50% correct

    # Reverse streak calculation — should be from most recent


# @router.get("/me/stats", response_model=PlayerStatsResponse)
# def get_my_stats(
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_db),
# ):
#     """Get the current user's profile and game statistics."""
#     return _build_player_stats(current_user, session)
