const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper that handles errors consistently.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.detail ||
      (typeof body?.detail === "object"
        ? JSON.stringify(body.detail)
        : `Request failed with status ${res.status}`);
    throw new Error(message);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface SignupResponse {
  message: string;
  user_id: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserMeResponse {
  user_data: {
    sub: string; // email
    nickname: string;
    exp: number;
  };
}

/**
 * Register a new user.
 */
export async function apiSignup(
  email: string,
  nickname: string,
  password: string
): Promise<SignupResponse> {
  return request<SignupResponse>("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, nickname, password }),
  });
}

/**
 * Login with email + password.
 * The backend expects x-www-form-urlencoded with `username` (= email) and `password`.
 */
export async function apiLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
}

/**
 * Get current user info from JWT.
 */
export async function apiGetMe(token: string): Promise<UserMeResponse> {
  return request<UserMeResponse>("/api/user/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Lobbies ─────────────────────────────────────────────────────────────────

import type { BackendLobby, Lobby, User, GameState, GameResults, PlayerStats } from "@/lib/types";

/**
 * Convert a backend lobby response into the shape the frontend components expect.
 */
function backendPlayerToUser(p: { id: number; nickname: string; email: string }): User {
  return { id: String(p.id), name: p.nickname, email: p.email };
}

function toLobby(b: BackendLobby): Lobby {
  return {
    id: String(b.id),
    name: b.name,
    subject: b.subject,
    maxPlayers: b.max_players,
    status: b.status as Lobby["status"],
    documentName: b.document_name ?? undefined,
    createdAt: b.created_at,
    host: backendPlayerToUser(b.host),
    players: b.players.map(backendPlayerToUser),
  };
}

/**
 * Get all lobbies (newest first).
 */
export async function apiGetLobbies(): Promise<Lobby[]> {
  const data = await request<BackendLobby[]>("/api/lobbies");
  return data.map(toLobby);
}

/**
 * Get a single lobby by ID.
 */
export async function apiGetLobby(lobbyId: string): Promise<Lobby> {
  const data = await request<BackendLobby>(`/api/lobbies/${lobbyId}`);
  return toLobby(data);
}

/**
 * Create a new lobby.
 */
export async function apiCreateLobby(
  token: string,
  lobby: { name: string; subject: string; max_players: number; document_name?: string }
): Promise<Lobby> {
  const data = await request<BackendLobby>("/api/lobbies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(lobby),
  });
  return toLobby(data);
}

/**
 * Join an existing lobby.
 */
export async function apiJoinLobby(token: string, lobbyId: string): Promise<Lobby> {
  const data = await request<BackendLobby>(`/api/lobbies/${lobbyId}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return toLobby(data);
}

/**
 * Leave a lobby (or delete it if you're the host).
 */
export async function apiLeaveLobby(token: string, lobbyId: string): Promise<void> {
  await request(`/api/lobbies/${lobbyId}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Document Upload ──────────────────────────────────────────────────────────

export async function apiUploadDocument(
  token: string,
  lobbyId: string,
  file: File
): Promise<{ message: string; document_name: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_URL}/api/lobbies/${lobbyId}/upload`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Upload failed with status ${res.status}`);
  }
  return res.json();
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export async function apiStartGame(
  token: string,
  lobbyId: string
): Promise<{ message: string; total_rounds: number }> {
  return request(`/api/game/${lobbyId}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetGameState(
  token: string,
  lobbyId: string
): Promise<GameState> {
  return request(`/api/game/${lobbyId}/state`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiSubmitAnswer(
  token: string,
  lobbyId: string,
  answerIndex: number
): Promise<{ is_correct: boolean; score: number }> {
  return request(`/api/game/${lobbyId}/answer?answer_index=${answerIndex}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetGameResults(
  token: string,
  lobbyId: string
): Promise<GameResults> {
  return request(`/api/game/${lobbyId}/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Player Profile / Stats ──────────────────────────────────────────────────

export async function apiGetMyStats(token: string): Promise<PlayerStats> {
  return request(`/api/user/me/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetPlayerStats(userId: number | string): Promise<PlayerStats> {
  return request(`/api/user/${userId}/stats`);
}
