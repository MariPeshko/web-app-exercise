# ai_core API Tester

This folder contains a local tester script for the `ai_core` FastAPI service.

## What it tests

- `GET /health`
- `POST /upload`
- `POST /generate-questions`
- `POST /validate-answer`
- `POST /chat`

## Prerequisites

From repo root (`ft_trascendence/`):

1. Create/activate virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Confirm `.env` exists in `ai_core/` and includes:
   - `OPENAI_API_KEY=...`

## Run local API (terminal 1)

From `ai_core/`:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Quick health checks:
- `http://127.0.0.1:8000/health` -> should return `{"status":"ok"}`
- `http://127.0.0.1:8000/docs` -> Swagger UI should load

Note: `http://127.0.0.1:8000/` is not a defined route and may show 404 in browser.

## Run tester (terminal 2)

From `ai_core/`:

```bash
python tests/api_tester.py --mode smoke --pdf "C:/path/to/document.pdf"
```

Optional flags:
- `--base-url http://127.0.0.1:8000`
- `--game-id my-test-id`
- `--num-questions 3`
- `--chat-message "Explain the main topic briefly"`
- `--timeout 120`

## Interactive mode (manual endpoint testing)

```bash
python tests/api_tester.py --mode interactive --pdf "C:/path/to/document.pdf"
```

Menu options allow teammates to:
- upload a document,
- generate questions,
- validate answers using generated question context,
- chat with the uploaded document.

## What success looks like

A healthy smoke run prints:
- `[UPLOAD] status=200`
- `[GENERATE_QUESTIONS] status=200`
- `[VALIDATE_ANSWER] status=200`
- `[CHAT] status=200`
- `Smoke test passed in ...s.`

## Troubleshooting

### 1) `Cannot connect to the API` / `WinError 10061`

Cause: API server is not running or wrong host/port.

Fix:
- Start server in terminal 1 with `uvicorn main:app --reload --host 127.0.0.1 --port 8000`
- Confirm `GET /health` or `/docs` works
- If using another port, pass `--base-url`

### 2) Proxy interference on localhost

Fix in tester terminal before running script:

```bash
$env:NO_PROXY = "127.0.0.1,localhost"
```

### 3) SSL certificate errors to `huggingface.co` during upload

Symptom: `SSLCertVerificationError` while downloading embedding model.

Fix:
1. Install Windows certificate bridge:
   - `pip install python-certifi-win32`
2. Restart `uvicorn`.
3. Retry tester.

### 4) `404 Game not found` on generate/chat

Cause: game was not uploaded (or wrong `game_id`).

Fix:
- Upload first and keep same `game_id`.
- Prefer a new `--game-id` each run.
