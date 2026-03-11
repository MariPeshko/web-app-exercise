# Authentication

How user authentication works end-to-end in StudAI.

---

## Overview

```
 Signup/Login form          Backend                   Database
      │                       │                          │
      │──POST /api/auth/─────>│                          │
      │                       │──verify/create user─────>│
      │                       │<─────────────────────────│
      │<──JWT token───────────│                          │
      │                       │                          │
      │  (token saved in      │                          │
      │   localStorage +      │                          │
      │   cookie)             │                          │
      │                       │                          │
      │──GET /api/user/me────>│                          │
      │  Authorization: Bearer│                          │
      │<──user data───────────│                          │
```

---

## Backend

### Password hashing

Passwords are hashed with **Argon2** (via `argon2-cffi`). Never stored in plaintext.

See `backend/auth_utils.py` for `get_password_hash()` and `verify_password()`.

### JWT tokens

- Signed with `SECRET_KEY` using `HS256`
- Expire after **60 minutes**
- Payload contains: `{ sub: email, nickname: string, exp: timestamp }`

Created by `create_access_token()` in `auth_utils.py`.

### Endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| `POST` | `/api/auth/signup` | `{ email, nickname, password }` (JSON) | `{ message, user_id }` |
| `POST` | `/api/auth/login` | `username=email&password=...` (form-urlencoded) | `{ access_token, token_type }` |
| `GET` | `/api/user/me` | — (Bearer token in header) | `{ user_data: { sub, nickname, exp } }` |

> **Note:** The login endpoint expects `x-www-form-urlencoded` (not JSON) because it uses FastAPI's `OAuth2PasswordRequestForm`. The field is called `username` but we send the email.

---

## Frontend

### Token storage

The JWT token is stored in **two places** simultaneously:

| Storage | Purpose |
|---------|---------|
| `localStorage` | Used by client-side JavaScript to attach `Authorization: Bearer <token>` headers to API calls |
| `cookie` (`access_token`) | Used by Next.js `proxy.ts` to check authentication on the server before the page loads |

Both are set/cleared together. See `setToken()` / `removeToken()` in `AuthContext.tsx`.

### AuthContext

`frontend/src/context/AuthContext.tsx` provides auth state to the entire app via React Context:

```tsx
const { user, isAuthenticated, login, signup, logout, isLoading } = useAuth();
```

| Function | What it does |
|----------|-------------|
| `login(email, password)` | Calls `/api/auth/login`, stores token, fetches user info |
| `signup(name, email, password)` | Calls `/api/auth/signup`, then auto-logs in |
| `logout()` | Clears token from localStorage + cookie, sets user to null |

On app mount, the context checks for an existing token in `localStorage` and restores the session by calling `/api/user/me`.

### API functions

All auth-related fetch calls are in `frontend/src/lib/api.ts`:

- `apiSignup(email, nickname, password)` → `POST /api/auth/signup`
- `apiLogin(email, password)` → `POST /api/auth/login`
- `apiGetMe(token)` → `GET /api/user/me`

---

## Route protection

`frontend/src/proxy.ts` runs before every matched route on the server side:

| Route | Behavior |
|-------|----------|
| `/dashboard`, `/lobby/*` | If no `access_token` cookie → redirect to `/login` |
| `/login`, `/signup` | If `access_token` cookie exists → redirect to `/dashboard` |
| Everything else | No check, passes through |

This means:
- You can't visit the dashboard without being logged in
- You can't visit the login page if you're already logged in
- The check happens server-side (before any page JavaScript runs)

### Why `proxy.ts` instead of `middleware.ts`?

Next.js 16 deprecated `middleware.ts` and renamed it to `proxy.ts`. Same API, same behavior — just a file and function name change.

---

## Token flow: step by step

1. User fills in login form and submits
2. Frontend calls `apiLogin(email, password)` → backend returns `{ access_token }`
3. Token is saved to `localStorage` and set as a cookie
4. Frontend calls `apiGetMe(token)` → backend decodes the JWT and returns the user info
5. `AuthContext` sets `user` state → app re-renders as authenticated
6. On subsequent page loads, `proxy.ts` checks the cookie → allows or redirects
7. `AuthContext.useEffect` reads token from `localStorage` → restores session
8. On logout, both storage locations are cleared

---

## Database model

```
users table
├── id              (int, primary key, auto-increment)
├── email           (string, unique)
├── nickname        (string, unique)
└── hashed_password (string, Argon2 hash)
```
