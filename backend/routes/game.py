from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlmodel import select
from datetime import datetime, timezone, UTC
import os
import httpx

from database import get_db
from dependencies import get_current_user
from models import (
    User, Lobby, LobbyPlayer, GameSession, GameQuestion, PlayerAnswer,
    GameStateResponse, QuestionResponse, PlayerScoreResponse,
    GameResultsResponse, LeaderboardEntry,
)

router = APIRouter(prefix="/game", tags=["Game"])

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://localhost:8001")


# def _get_lobby_and_session(lobby_id: int, session: Session)


# def _compute_scores(game: GameSession, session: Session) -> list[PlayerScoreResponse]:
#    """Aggregate scores per player."""
#    # Also include players with no answers yet


# def _advance_round_if_needed(game: GameSession, session: Session):
#    """Auto-advance round if timer expired."""


# @router.post("/{lobby_id}/start")
# def start_game(lobby_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_db)):
#    """Host starts the game: generates questions via AI core."""

    # Call AI core to generate questions
    # try:
    #     with httpx.Client(timeout=120.0) as client:
    #         resp = client.post(
    #             f"{RAG_SERVICE_URL}/generate-questions",
    #             json={"game_id": str(lobby_id), "num_questions": 10},
    #         )
    #         resp.raise_for_status()
    #         data = resp.json()
    # except httpx.HTTPStatusError as e:
    #     raise HTTPException(status_code=502, detail=f"AI service error: {e.response.text}")
    # except httpx.RequestError as e:
    #     raise HTTPException(status_code=502, detail=f"Cannot reach AI service: {str(e)}")

    # Create game session
    # Create question rows
    # Pad options to 4 if fewer
    # Update lobby status


# @router.get("/{lobby_id}/state", response_model=GameStateResponse)
# def get_game_state(lobby_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_db)):
#   """Get current game state: question, timer, scores."""
    # Auto-advance round if timer expired
    # Calculate time remaining
	# Get current question (never leak correct_index)
    # Check if user already answered this round


# @router.post("/{lobby_id}/answer")
# def submit_answer(
#     lobby_id: int,
#     answer_index: int,
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_db),
# ):
#     """Submit an answer for the current round."""
    # Check player is in lobby
    # Check for duplicate answer
    # Check timer
    # Get the correct answer


# @router.get("/{lobby_id}/results", response_model=GameResultsResponse)
# def get_game_results(
#     lobby_id: int,
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_db),
# ):
#     """Get final leaderboard."""
