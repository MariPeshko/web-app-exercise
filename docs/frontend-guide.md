# Frontend Guide

How the Next.js frontend is structured and how to work with it.

---

## Tech stack

| Tool | Purpose |
|------|---------|
| Next.js 16 (App Router) | React framework, routing, server-side features |
| Tailwind CSS 4 | Utility-first CSS |
| shadcn/ui | Pre-built accessible UI components (`Button`, `Card`, `Badge`, `Input`, etc.) |
| Framer Motion | Animations (bouncy springs, stagger effects) |
| lucide-react | Icons |

---

## Running the frontend

```bash
cd frontend
npm install    # first time or after a git pull that changes package.json
npm run dev    # starts on http://localhost:3000
```

The frontend needs the backend running (`docker-compose up -d`) to do anything useful.

---

## Key files

| File | What it does |
|------|-------------|
| `src/proxy.ts` | Route protection — redirects unauthenticated users away from protected pages |
| `src/context/AuthContext.tsx` | Global auth state — provides `user`, `login()`, `signup()`, `logout()` |
| `src/lib/api.ts` | All HTTP calls to the backend — auth, lobbies, etc. |
| `src/lib/types.ts` | TypeScript interfaces (`User`, `Lobby`, `BackendLobby`, etc.) |
| `src/lib/animations.ts` | Framer Motion presets (`springBouncy`, `fadeInUp`, `staggerContainer`, etc.) |
| `next.config.ts` | Next.js config — currently sets `turbopack.root` for correct module resolution |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:8000` |

---

## Pages

| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Public | Landing page with CTA |
| `/login` | `app/login/page.tsx` | Public (redirects if logged in) | Email + password login |
| `/signup` | `app/signup/page.tsx` | Public (redirects if logged in) | Registration form |
| `/dashboard` | `app/dashboard/page.tsx` | Protected | Lobby list, search, filter, create/join |
| `/lobby/[id]` | `app/lobby/[id]/page.tsx` | Protected | Waiting room with player slots |

---

## Adding a new API call

1. Add the function to `src/lib/api.ts`
2. If the response has a new shape, add a `Backend*` interface to `src/lib/types.ts`
3. Add a frontend-facing interface (camelCase) to `types.ts` if needed
4. Write a converter function (like `toLobby()`) to map snake_case → camelCase

Example pattern:
```ts
// In api.ts
export async function apiDoSomething(token: string, data: SomeInput): Promise<SomeOutput> {
  const raw = await request<BackendSomeOutput>("/api/something", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return toSomeOutput(raw); // convert snake_case → camelCase
}
```

---

## Adding a new protected page

1. Create the page file: `src/app/your-route/page.tsx`
2. Add `"use client";` at the top (if it uses hooks, state, or browser APIs)
3. Add the route to `proxy.ts`:
   - Add to `protectedRoutes` array if it requires login
   - Add to `config.matcher` so the proxy actually runs on that path

```ts
// proxy.ts
const protectedRoutes = ["/dashboard", "/lobby", "/your-route"];

export const config = {
  matcher: ["/dashboard/:path*", "/lobby/:path*", "/your-route/:path*", "/login", "/signup"],
};
```

---

## Route protection: `proxy.ts`

This file used to be called `middleware.ts` — Next.js 16 renamed the convention to `proxy.ts`. Same API, same behavior.

It runs on the server before the page loads and checks for the `access_token` cookie:
- No cookie + protected route → redirect to `/login`
- Has cookie + auth route (`/login`, `/signup`) → redirect to `/dashboard`

---

## Animations

The app uses a consistent "bouncy, playful" animation style. All presets are in `src/lib/animations.ts`.

Commonly used:

| Preset | Usage |
|--------|-------|
| `springBouncy` | Default spring transition for hover/tap |
| `fadeInUp` | Sections that fade in and slide up on mount |
| `staggerContainer` + `staggerChild` | Lists where items animate in one by one |

Use them like:
```tsx
<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  ...
</motion.div>
```

---

## Environment

The frontend only has one env var:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This is in `.env.local` (git-ignored). The `NEXT_PUBLIC_` prefix makes it available in browser-side code.

If this is missing, `api.ts` falls back to `http://localhost:8000`.

---

## `next.config.ts`

```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};
```

The `turbopack.root` setting tells Next.js where to resolve node_modules from. Without it, Turbopack uses the git root (one level up), which doesn't have `node_modules` and causes `Can't resolve 'tailwindcss'` errors.
