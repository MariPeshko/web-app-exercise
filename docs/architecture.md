# StudAI Architecture

## How the pieces fit together

All project services are containerized and managed via Docker Compose. They communicate with each other over a single virtual network, `studai-net`.

```
 ┌────────────────┐
 │    Browser     │
 └───────┬────────┘
         │ HTTP
         ▼
┌─────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Frontend   │─────> │   Backend    │──────>│   ai_core    │──────>│     OpenAI   │
│  (Next.js)  │ HTTP  │  (FastAPI)   │ HTTP  │ (LangChain)  │  API  │    GPT-4o    │
│  port 3000  │       │  port 8000   │       │  port 8001   │       └──────────────┘
└─────────────┘       └───────┬──────┘       └──────────────┘
     Docker                   │ SQL
                              ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │   Database   │
                        │  port 5432   │
                        └──────────────┘
                             Docker
```

**Four core services running in Docker:**

| Service      | Tech       | Port | Docker Service Name | Purpose |
|--------------|------------|--------|-------------------|---------|
| **Frontend** | Next.js 16 | `3000` | `frontend`        | User-facing client interface. |
| **Backend**  | FastAPI    | `8000` | `backend` | Core business logic, authentication, game management. |
| **AI Core**  | FastAPI    | `8001` | `ai_core` | PDF processing and question generation (RAG). |
| **Database** | PostgreSQL | `5432` | `db`      | All data storage (users, games, scores). |

---

## Quickstart

The project is designed to be run via Docker Compose. This ensures all services start with the correct configuration and are on the same network.

```bash
# 1. Ensure you have a .env file in the project root.

# 2. Start all services (from the project root)
docker compose up --build

# 3. Open http://localhost:3000 in your browser.
```
The `--build` flag ensures that any changes to the source code (including `requirements.txt` or `package.json`) are included before starting.

---

## Project structure

```
StudAI/
├── .env                          # Env vars for Docker (DB creds, secret key, etc.)
├── docker-compose.yml            # Orchestrates all containers.
│
├── backend/                      # FastAPI Python app
│   ├── main.py                   # App entry point, CORS, router registration
│   ├── database.py               # DB engine, session factory
│   ├── dependencies.py           # Reusable dependencies (e.g., get_current_user)
│   ├── auth_utils.py             # Password hashing (Argon2), JWT creation
│   ├── models.py                 # All database models + Pydantic schemas
│   ├── routes/
│   │   ├── auth.py               # POST /api/auth/signup, /api/auth/login
│   │   ├── user.py               # GET  /api/user/me
│   │   └── ...
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                     # Next.js 16 app
│   ├── next.config.ts            # Next.js config, includes proxy to backend
│   ├── src/
│   │   ├── proxy.ts              # Route protection (replaces middleware.ts)
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # React auth state (login, signup, logout)
│   │   ├── lib/
│   │   │   ├── api.ts            # All fetch calls to the backend
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   └── animations.ts     # Framer Motion presets
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page (/)
│   │   │   ├── login/page.tsx    # Login page
│   │   │   ├── signup/page.tsx   # Signup page
│   │   │   ├── dashboard/page.tsx # Lobby list, create/join
│   │   │   └── lobby/[id]/page.tsx # Lobby waiting room
│   │   └── components/           # Reusable UI components (shadcn/ui based)
│   └── package.json
│
├── ai_core/                      # AI question generation service (separate)
├── analytics_core/               # Analytics service (separate)
├── gateway/                      # Nginx config (not active yet)
└── docs/                         # Documentation
```

---

## Environment variables

The root `.env` file is the single source of truth for configuring all services managed by Docker Compose.

| Variable | Value | Used by |
|----------|-------|---------|
| `POSTGRES_USER` | `quiz_admin` | db container |
| `POSTGRES_PASSWORD` | `secure_pass` | db container |
| `POSTGRES_DB` | `quiz_game_db` | db container |
| `DATABASE_URL` | `postgresql://quiz_admin:secure_pass@db:5432/quiz_game_db` | backend |
| `SECRET_KEY` | `super_secret_key_for_testing` | backend (JWT signing) |
| `OPENAI_API_KEY` | `sk-xxxxxxxxxxxxxxxx` | `ai_core` container |

### Frontend `.env.local`

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Where the frontend sends API requests |

---

## Docker Compose Notes

- **`depends_on`:** The `backend` service will not start until the `db` service passes its `healthcheck` (i.e., the database is ready to accept connections).
- **`volumes`:** Source code from local folders (`./backend`, `./frontend`, etc.) is mounted into the containers. This enables hot-reloading, allowing code changes to take effect without rebuilding the image.
- **`networks`:** All services are attached to the `studai-net` network, allowing them to resolve each other by their service names (`db`, `ai_core`, `backend`).
