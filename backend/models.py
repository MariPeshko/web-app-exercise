from typing import Optional, List
from pydantic import EmailStr
from sqlmodel import Field, SQLModel # Relationship


# ─── Users ────────────────────────────────────────────────────────────────────

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    nickname: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)

    # Relationships
    # hosted_lobbies: List["Lobby"] = Relationship(back_populates="host")
    # lobby_memberships: List["LobbyPlayer"] = Relationship(back_populates="player")

class UserCreate(SQLModel):
    email: EmailStr
    nickname: str
    password: str

class UserResponse(SQLModel):
    id: int
    email: EmailStr
    nickname: str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# ─── Lobbies ──────────────────────────────────────────────────────────────────

# class LobbyPlayer(SQLModel, table=True):
#     """Join table: which users are in which lobbies."""
#     __tablename__ = "lobby_players"


# class Lobby(SQLModel, table=True):
#     __tablename__ = "lobbies"

#     # Foreign key to the host (creator)
#     # Relationships


# ─── Lobby Request / Response schemas ────────────────────────────────────────

# class LobbyCreate(SQLModel):

# class PlayerInfo(SQLModel):
#     """Lightweight user info returned inside a lobby."""

# class LobbyResponse(SQLModel):
#     """What the frontend receives for each lobby."""


# ─── Game Sessions ─────────────────────────────────────────────────────────
# from sqlalchemy import UniqueConstraint for class PlayerAnswer(SQLModel, table=True):

# class GameSession(SQLModel, table=True):
#     __tablename__ = "game_sessions"
#     # Relationships


# class GameQuestion(SQLModel, table=True):
#     __tablename__ = "game_questions"


# class PlayerAnswer(SQLModel, table=True):
#     __tablename__ = "player_answers"
#     __table_args__ = (
#         UniqueConstraint("game_session_id", "player_id", "round_number"),
#     )


# ─── Game Response Schemas ──────────────────────────────────────────────────

# class QuestionResponse(SQLModel):

# class PlayerScoreResponse(SQLModel):

# class GameStateResponse(SQLModel):

# class LeaderboardEntry(SQLModel):

# class GameResultsResponse(SQLModel):
#     status: str
#     leaderboard: List[LeaderboardEntry]


# ─── Player Profile / Stats Schemas ────────────────────────────────────────

# class GameHistoryEntry(SQLModel):

# class PlayerStatsResponse(SQLModel):
