# StudAI

A multiplayer AI-powered trivia game where players upload study documents and compete in real-time quizzes generated from the content. Built as a school project at 42.

## How to run a project

1. Create a `.env` file in the project root by copying .env.example.
Ask the team to provide the secret OPENAI_API_KEY.

2. Start all services:
```bash
docker compose up --build
```

In case of any error and its solving, it is recommended:

```bash
docker compose down
# and then again
docker compose up --build
```

3. Open http://localhost:3000 in your browser.

# Useful commands
```bash
# View logs for a specific service
docker compose logs -f backend
docker compose logs -f ai_core
docker compose logs -f frontend

# Restart a single service (no rebuild needed if using volume mounts)
docker compose restart backend

# Stop and remove all data (reset database)
docker compose down -v
```

## Features

- **AI Question Generation** -- Upload a PDF and the AI core generates trivia questions from its content using OpenAI + RAG (Retrieval-Augmented Generation)
- **Real-time Multiplayer** -- Create lobbies, invite friends, and compete head-to-head with live scoreboards
- **Time-based Scoring** -- Faster correct answers earn more points (1000 max, decreasing over 30 seconds)
- **Player Profiles & Analytics** -- Track games played, win rate, accuracy, response time, streaks, and full game history
- **Neo-brutalist UI** -- Bold design with hard shadows, bouncy animations, and dark mode support

## Architecture

```
frontend (Next.js 16)  -->  backend (FastAPI)  -->  PostgreSQL
                                |
                            ai_core (FastAPI + LangChain + FAISS)
                                |
                            OpenAI GPT-4o
```

| Service   | Port | Description                              |
|-----------|------|------------------------------------------|
| frontend  | 3000 | Next.js app with Tailwind + Framer Motion |
| backend   | 8000 | FastAPI REST API, auth, game logic        |
| ai_core   | 8001 | PDF processing, question generation (RAG) |
| db        | 5432 | PostgreSQL 15                             |

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, shadcn/ui, Radix UI

**Backend:** Python 3.12, FastAPI, SQLModel, PostgreSQL, JWT auth (PyJWT), Argon2 password hashing

**AI Core:** Python 3.11, LangChain, FAISS vector store, HuggingFace embeddings, OpenAI GPT-4o

**Infrastructure:** Docker Compose, 4 containerized services

### How to Play

1. **Create an account** -- Sign up on the landing page
2. **Create a lobby** -- From the dashboard, click "Create Lobby", name it, pick a subject, and attach a PDF study document
3. **Invite players** -- Share the lobby link or have friends join from the dashboard
4. **Start the game** -- Once 2+ players have joined and a document is uploaded, the host clicks "Start Game"
5. **Answer questions** -- 10 AI-generated questions, 30 seconds each. Answer fast for more points!
6. **See results** -- After all rounds, the leaderboard shows final rankings
7. **Check profiles** -- Click any player's name to see their stats and game history

## API Endpoints

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/signup    | Register new user    |
| POST   | /api/auth/login     | Login (returns JWT)  |

### User
| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | /api/user/me         | Current user info        |
| GET    | /api/user/me/stats   | Current user stats       |
| GET    | /api/user/{id}/stats | Any player's stats       |

### Lobbies
| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| GET    | /api/lobbies                  | List all lobbies       |
| GET    | /api/lobbies/{id}             | Get lobby details      |
| POST   | /api/lobbies                  | Create a lobby         |
| POST   | /api/lobbies/{id}/join        | Join a lobby           |
| POST   | /api/lobbies/{id}/leave       | Leave a lobby          |
| POST   | /api/lobbies/{id}/upload      | Upload PDF document    |

### Game
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| POST   | /api/game/{id}/start      | Start game (host only)          |
| GET    | /api/game/{id}/state      | Get current question + scores   |
| POST   | /api/game/{id}/answer     | Submit answer                   |
| GET    | /api/game/{id}/results    | Get final leaderboard           |

## Project Structure

```
StudAI/
  backend/            # FastAPI backend
    routes/
      auth.py         # Signup/login endpoints
      lobby.py        # Lobby CRUD + document upload
      game.py         # Game session management
      user.py         # User profile + stats
    models.py         # SQLModel database models
    deps.py           # Shared auth dependency
    database.py       # DB connection + session
    auth_utils.py     # JWT + password hashing

  ai_core/            # AI question generation service
    main.py           # FastAPI endpoints (upload, generate, chat)
    logic.py          # Question generation with LangChain
    utils.py          # PDF processing, FAISS vectorstore
    models.py         # Pydantic models for AI responses

  frontend/           # Next.js frontend
    src/app/
      dashboard/      # Lobby list + stats
      lobby/[id]/     # Lobby waiting room
      game/[id]/      # Game play page
      game/[id]/results/  # Results + leaderboard
      profile/[id]/   # Player profile + analytics
    src/components/   # Reusable UI components (shadcn)
    src/lib/          # API client, types, animations
    src/context/      # Auth context provider
```

## Team

Built by the StudAI team at 42.
