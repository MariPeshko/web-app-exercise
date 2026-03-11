export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Lobby {
  id: string;
  name: string;
  host: User;
  players: User[];
  maxPlayers: number;
  subject: string;
  status: "waiting" | "in-progress" | "finished";
  documentName?: string;
  createdAt: string;
}

export interface StudyQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// ─── Backend response shapes (used by api.ts to convert) ─────────────────────

export interface BackendPlayer {
  id: number;
  nickname: string;
  email: string;
}

export interface BackendLobby {
  id: number;
  name: string;
  subject: string;
  max_players: number;
  status: string;
  document_name: string | null;
  created_at: string;
  host: BackendPlayer;
  players: BackendPlayer[];
}

// ─── Game types ──────────────────────────────────────────────────────────────

export interface GameQuestion {
  round_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface PlayerScore {
  player_id: number;
  nickname: string;
  score: number;
  correct_count: number;
}

export interface GameState {
  status: "generating" | "active" | "finished";
  current_round: number;
  total_rounds: number;
  time_remaining: number;
  question: GameQuestion | null;
  scores: PlayerScore[];
  my_answer: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  player_id: number;
  nickname: string;
  score: number;
  correct_count: number;
}

export interface GameResults {
  status: string;
  leaderboard: LeaderboardEntry[];
}

// ─── Player Profile / Stats ─────────────────────────────────────────────────

export interface GameHistoryEntry {
  game_id: number;
  lobby_name: string;
  subject: string;
  rank: number;
  score: number;
  correct_count: number;
  total_rounds: number;
  played_at: string;
}

export interface PlayerStats {
  player_id: number;
  nickname: string;
  email: string;
  games_played: number;
  games_won: number;
  total_score: number;
  total_correct: number;
  total_questions: number;
  accuracy: number;
  avg_score_per_game: number;
  avg_response_time: number;
  best_score: number;
  current_streak: number;
  game_history: GameHistoryEntry[];
}
