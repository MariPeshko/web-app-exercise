from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlmodel import Session, select
from typing import List
import os
import httpx

from database import get_db
from dependencies import get_current_user

# -----------------------------------------------------------------------------
# Murat's sugestions for backend
# -----------------------------------------------------------------------------

router = APIRouter(prefix="/lobbies", tags=["Lobbies"])

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://localhost:8001")


# ─── Helper: convert a Lobby row → LobbyResponse ─────────────────────────────

# def lobby_to_response(lobby: Lobby) -> LobbyResponse:
#     """Turn a Lobby ORM object into the response the frontend expects."""
#     return LobbyResponse(    )


# ─── Routes ──────────────────────────────────────────────────────────────────

# @router.get("", response_model=List[LobbyResponse])
# def list_lobbies(session: Session = Depends(get_db)):
#     """Return all lobbies (newest first)."""


# @router.get("/{lobby_id}", response_model=LobbyResponse)
# def get_lobby(lobby_id: int, session: Session = Depends(get_db)):


# @router.post("", response_model=LobbyResponse, status_code=status.HTTP_201_CREATED)
# def create_lobby():
#     """Create a new lobby. The creator is automatically added as a player."""


# @router.post("/{lobby_id}/join", response_model=LobbyResponse)
# def join_lobby():
#     """Join an existing lobby."""


# @router.post("/{lobby_id}/leave", response_model=LobbyResponse)
# def leave_lobby():
#     """Leave a lobby. If the host leaves, the lobby is deleted."""
#     # If the host leaves → delete the whole lobby
#         # Remove all player links first, then the lobby


# @router.post("/{lobby_id}/upload")
# def upload_document(
#     lobby_id: int,
#     file: UploadFile = File(...),
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_db),
# ):
#     """Host uploads a PDF document, forwarded to the AI core service."""

    # Forward to AI core
    # try:
    #     with httpx.Client(timeout=60.0) as client:
    #         resp = client.post(
    #             f"{RAG_SERVICE_URL}/upload",
    #             params={"game_id": str(lobby_id)},
    #             files={"file": (file.filename, file.file, file.content_type)},
    #         )
    #         resp.raise_for_status()
    # except httpx.HTTPStatusError as e:
    #     raise HTTPException(status_code=502, detail=f"AI service error: {e.response.text}")
    # except httpx.RequestError as e:
    #     raise HTTPException(status_code=502, detail=f"Cannot reach AI service: {str(e)}")

    # Update lobby with document name
