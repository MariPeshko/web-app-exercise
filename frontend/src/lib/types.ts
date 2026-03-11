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
