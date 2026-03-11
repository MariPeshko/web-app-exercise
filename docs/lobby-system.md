# Lobby System

How lobbies work — from database models to the waiting room UI.

---

## Overview

A lobby is a "room" where players gather before a quiz starts. The host creates it, other players join, and (eventually) the host starts the game.

```
Dashboard ──create──▶ Lobby waiting room ──start──▶ Game (not built yet)
    │                      ▲
    └──join────────────────┘
```

---

## Database models

Three tables are involved:

```
users                    lobbies                     lobby_players
├── id ◀────────────────── host_id (FK)              (join table)
├── email                ├── id ◀────────────────── lobby_id (FK)
├── nickname             ├── name                   ├── player_id (FK) ──▶ users.id
└── hashed_password      ├── subject                └── joined_at
                         ├── max_players (default 4)
                         ├── status (waiting|in-progress|finished)
                         ├── document_name (optional)
                         └── created_at
```

**Key relationships:**
- A lobby has one **host** (the user who created it) via `host_id`
- A lobby has many **players** through the `lobby_players` join table
- The host is also a player (automatically added on creation)

All models are defined in `backend/models.py` using SQLModel.

---

## Backend endpoints

All prefixed with `/api/lobbies`. Defined in `backend/routes/lobby.py`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/lobbies` | No | List all lobbies (newest first) |
| `GET` | `/api/lobbies/{id}` | No | Get a single lobby with player list |
| `POST` | `/api/lobbies` | Yes | Create a lobby (you become host + first player) |
| `POST` | `/api/lobbies/{id}/join` | Yes | Join a lobby |
| `POST` | `/api/lobbies/{id}/leave` | Yes | Leave a lobby (or delete it if you're the host) |

### Create lobby request

```json
{
  "name": "Calculus Study Session",
  "subject": "Math",
  "max_players": 4,
  "document_name": "calc_notes.pdf"   // optional
}
```

### Lobby response shape

Every endpoint that returns a lobby uses this format:

```json
{
  "id": 1,
  "name": "Calculus Study Session",
  "subject": "Math",
  "max_players": 4,
  "status": "waiting",
  "document_name": "calc_notes.pdf",
  "created_at": "2026-03-06T12:00:00Z",
  "host": {
    "id": 1,
    "nickname": "Alice",
    "email": "alice@example.com"
  },
  "players": [
    { "id": 1, "nickname": "Alice", "email": "alice@example.com" },
    { "id": 2, "nickname": "Bob", "email": "bob@example.com" }
  ]
}
```

### Business rules

- Only lobbies with `status: "waiting"` accept new players
- You can't join a lobby you're already in
- You can't join a full lobby (`players.length >= max_players`)
- If the **host** leaves, the entire lobby is deleted (including all player links)
- If a regular player leaves, they're just removed from the player list

---

## Frontend

### API functions

All in `frontend/src/lib/api.ts`:

| Function | Endpoint | Auth |
|----------|----------|------|
| `apiGetLobbies()` | `GET /api/lobbies` | No |
| `apiGetLobby(id)` | `GET /api/lobbies/{id}` | No |
| `apiCreateLobby(token, data)` | `POST /api/lobbies` | Yes |
| `apiJoinLobby(token, id)` | `POST /api/lobbies/{id}/join` | Yes |
| `apiLeaveLobby(token, id)` | `POST /api/lobbies/{id}/leave` | Yes |

### Data conversion

The backend returns snake_case (`max_players`, `created_at`). The frontend uses camelCase (`maxPlayers`, `createdAt`). The conversion happens in `api.ts` via the `toLobby()` and `backendPlayerToUser()` helper functions.

```
Backend (Python)                    Frontend (TypeScript)
──────────────                      ────────────────────
BackendLobby                   ──▶  Lobby
  .max_players                       .maxPlayers
  .document_name                     .documentName
  .created_at                        .createdAt
  .host { id, nickname, email } ──▶  .host { id, name, email }
  .players[]                    ──▶  .players[]
```

Types are defined in `frontend/src/lib/types.ts`:
- `BackendLobby` / `BackendPlayer` — raw API response shapes
- `Lobby` / `User` — what the frontend components actually use

### Pages

#### Dashboard (`/dashboard`)

- Shows all lobbies in a card grid
- Search bar + status filter (all / waiting / active / finished)
- "Create Lobby" button opens a modal
- Each lobby card has a "Join" button
- **After creating or joining**, you're automatically navigated to the waiting room

#### Waiting Room (`/lobby/[id]`)

- Shows the lobby name, host, subject, and status
- **Player slots grid**: filled slots show avatar + name, empty slots show dashed placeholders
- **Crown icon** next to the host's name
- **Copy Link** button to share the URL with teammates
- **Start Game** button: visible to host only, requires 2+ players (placeholder — no game logic yet)
- **Leave / Delete** button: says "Delete Lobby" for the host, "Leave Lobby" for others
- **Auto-polling**: fetches lobby data every 3 seconds so new players appear without refreshing

### Components

- `LobbyCard` (`components/LobbyCard.tsx`) — card used on the dashboard for each lobby
- `CreateLobbyModal` (`components/CreateLobbyModal.tsx`) — modal form for creating a new lobby

---

## Lobby lifecycle

```
1. Host creates lobby          → status: "waiting"
2. Players join                → still "waiting"
3. Host clicks Start Game      → status: "in-progress" (NOT IMPLEMENTED YET)
4. Game ends                   → status: "finished"    (NOT IMPLEMENTED YET)
```

Currently, nothing transitions the status from `"waiting"`. The Start Game button exists in the UI but has no backend logic behind it.

---

## Testing multiplayer locally

You can test with two browser tabs:

1. Open `http://localhost:3000` in Tab A → sign up as User 1
2. Open `http://localhost:3000` in a private/incognito window (Tab B) → sign up as User 2
3. User 1: create a lobby from the dashboard
4. User 2: refresh the dashboard → the lobby appears → click "Join"
5. Both users are now in the waiting room, and they'll see each other within 3 seconds (polling)
