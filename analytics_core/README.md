## Analytics Core

Analytics service for StudAI built with FastAPI.

This module is responsible for:
- event ingestion (`/analytics/events`)
- KPI and time-series aggregation (`/analytics/kpis`, `/analytics/timeseries`)
- exports (`/analytics/export.csv`, `/analytics/export.pdf`)
- real-time streaming (`/analytics/realtime/stream`)

---

## What We Built

`analytics_core` is an event-driven analytics service for the AI trivia game.

It currently supports:
- event ingestion for gameplay activity (start, answer, finish, uploads, generation)
- computed analytics for dashboard cards and time series
- export flows (CSV and PDF)
- realtime updates via SSE
- a built-in dashboard page at `/dashboard`

Core KPIs returned by `/analytics/kpis`:
- `games_played`
- `avg_score`
- `best_score`
- `avg_answer_time_ms`
- `active_users`

---

## API Endpoints

Base prefix: `/analytics`

### Event ingestion
- `POST /analytics/events`
- `POST /analytics/events/batch`

### Analytics reads
- `GET /analytics/kpis?from=<ISO>&to=<ISO>&mode=<solo|group>&user_id=<optional>`
- `GET /analytics/timeseries?metric=<games_played|avg_score|avg_answer_time_ms>&interval=<minute|hour|day|week>&from=<ISO>&to=<ISO>&mode=<solo|group>&user_id=<optional>`

### Export
- `GET /analytics/export.csv?from=<ISO>&to=<ISO>&mode=<optional>&user_id=<optional>`
- `GET /analytics/export.pdf?from=<ISO>&to=<ISO>`

### Realtime
- `GET /analytics/realtime/stream`

### Utility
- `GET /health`
- `GET /docs`
- `GET /dashboard`

---

## Project Layout

```text
analytics_core/
  app/
    api/        # FastAPI routes
    core/       # config, auth, logging
    db/         # models, session, repository, init script
    jobs/       # batch/minutely rollups
    schemas/    # Pydantic input/output models
    services/   # business logic
    main.py     # FastAPI app entrypoint
  tests/
  .env.example
```

---

## Quick Start (Linux/macOS)

From repository root (`ft_trascendence`):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Then move to analytics module:

```bash
cd analytics_core
cp .env.example .env
```

Start API:

```bash
uvicorn app.main:app --reload --port 8001
```

Health check:

```bash
curl http://127.0.0.1:8001/health
```

Open docs and dashboard:

```text
http://127.0.0.1:8001/docs
http://127.0.0.1:8001/dashboard
```

---

## Quick Start (Windows)

From repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Then:

```powershell
cd analytics_core
copy .env.example .env
uvicorn app.main:app --reload --port 8001
```

---

## Environment Variables

Use `analytics_core/.env.example` as baseline.

Important values:
- `DATABASE_URL`: PostgreSQL connection string
- `API_PREFIX`: defaults to `/analytics`
- `AUTH_ENABLED`: `false` for local dev unless you want API key checks

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db
API_PREFIX=/analytics
AUTH_ENABLED=false
```

Important:
- `python -m app.db.init_db` creates tables only. It does not create the PostgreSQL database itself.
- If `DATABASE_URL` points to a database that does not exist yet, startup fails with: `FATAL: database "<name>" does not exist`.

---

## Mocked Database Workflow (Recommended for Local Testing)

Use this workflow when testing `/dashboard` with generated/mock events.

To avoid confusion, this README uses one test database name consistently:
- `analytics_test_db`
- URL: `postgresql+psycopg://postgres:postgres@localhost:5432/analytics_test_db`

If you prefer `analytics_db`, replace the name everywhere (Docker + `DATABASE_URL`).

---

## Database Setup

Create tables from `analytics_core`:

```bash
python -m app.db.init_db
```

Expected success output:

```text
Analytics tables created.
```

If this hangs or fails, check:
- PostgreSQL is running
- host/port/user/password are correct
- database in `DATABASE_URL` exists

---

## How We Test the Dashboard (Current Workflow)

The dashboard is currently tested with mocked/generated gameplay events inserted through the API.

Before starting:
- Run all commands below from `analytics_core`.
- Keep using the same terminal window for steps 2-4.
- In PowerShell, `$env:DATABASE_URL=...` only affects the current terminal session.

### 1) Start PostgreSQL with Docker (creates `analytics_test_db`)

Linux/macOS:

```bash
docker run --name analytics-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=analytics_test_db \
  -p 5432:5432 \
  -d postgres:16
```

Windows PowerShell:

```powershell
docker run --name analytics-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=analytics_test_db `
  -p 5432:5432 `
  -d postgres:16
```

If container `analytics-postgres` already exists, start it instead:

```powershell
docker start analytics-postgres
```

### 2) Point app to test DB and verify env value

From `analytics_core`:

Linux/macOS:

```bash
export DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/analytics_test_db"
echo $DATABASE_URL
```

Windows PowerShell:

```powershell
$env:DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/analytics_test_db"
$env:DATABASE_URL
```

### 3) Init schema in that same terminal

```bash
python -m app.db.init_db
```

Expected:

```text
Analytics tables created.
```

### 4) Start API (same terminal where `DATABASE_URL` was set)

```bash
uvicorn app.main:app --reload --port 8001
```

### 5) Seed mock events

From `analytics_core/tests`:

```bash
python seed_mock_events.py
```

Expected output similar to:

```text
Seeded 5828 events
```

### 6) Validate endpoints used by dashboard

```bash
curl "http://127.0.0.1:8001/analytics/kpis?from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z"
curl "http://127.0.0.1:8001/analytics/timeseries?metric=games_played&interval=day&from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z"
curl "http://127.0.0.1:8001/analytics/timeseries?metric=avg_score&interval=day&from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z"
```

PowerShell tip: use `curl.exe` to avoid alias behavior of `curl`.

### 7) Open dashboard

```text
http://127.0.0.1:8001/dashboard
```

Check:
- KPI cards render values
- charts populate and refresh
- export buttons download files
- realtime panel updates while new events are ingested

---

## Running Tests

From `analytics_core`:

```bash
python -m pytest -q
```

Current tests include a health endpoint smoke test.
As integration tests are added, point `DATABASE_URL` to a dedicated test database.

---

## Dashboard Features Included

The built-in page at `/dashboard` already includes:
- 4 analytics calls (`kpis` + 3 timeseries metrics)
- export buttons for CSV and PDF
- realtime widget via server-sent events (`/analytics/realtime/stream`)
- date range and mode filters

---

## Notes for Teammates

- Run commands from `analytics_core` when using module paths like `app.main:app` or `python -m app...`.
- If launching from repo root, use:
  - `uvicorn --app-dir analytics_core app.main:app --reload --port 8001`
- Keep analytics dependencies in root `requirements.txt` (shared venv at repo root).
