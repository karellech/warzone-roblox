// src/services/api.ts
// Point central de tous les appels HTTP vers le backend.
// Importer depuis ici dans chaque composant, jamais utiliser fetch/axios directement.

import axios, { type AxiosResponse} from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 8000,
});

// ── Types TypeScript ─────────────────────────────────────────────
// Miroir exact des schemas Pydantic du backend

export interface Player {
  id: string;
  roblox_user_id: number;
  username: string;
  total_kills: number;
  total_deaths: number;
  total_matches: number;
  grade: string;
  created_at: string;
}

export interface Match {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  winning_team: string | null;
  status: "ongoing" | "finished";
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  roblox_user_id: number;
  total_kills: number;
  total_deaths: number;
  total_matches: number;
  grade: string;
  kd_ratio: number;
}

// ── Helpers ──────────────────────────────────────────────────────

export const kdRatio = (kills: number, deaths: number): string => {
  if (deaths === 0) return kills.toFixed(2);
  return (kills / deaths).toFixed(2);
};

export const gradeColor: Record<string, string> = {
  Recrue:     "bg-gray-500",
  Soldat:     "bg-blue-500",
  Sergent:    "bg-yellow-500",
  Lieutenant: "bg-purple-500",
  Général:    "bg-red-500",
};

// ── Appels API ───────────────────────────────────────────────────

export const getLeaderboard = (limit = 50) =>
  api.get<LeaderboardEntry[]>(`/api/leaderboard?limit=${limit}`).then((r: AxiosResponse<LeaderboardEntry[]>) => r.data);

export const getPlayer = (robloxId: number) =>
  api.get<Player>(`/api/players/${robloxId}`).then(r => r.data);

export const getPlayerMatches = (robloxId: number) =>
  api.get<Match[]>(`/api/players/${robloxId}/matches`).then(r => r.data);

export const getMatches = (limit = 20) =>
  api.get<Match[]>(`/api/matches?limit=${limit}`).then(r => r.data);

export const getMatch = (matchId: string) =>
  api.get<Match>(`/api/matches/${matchId}`).then(r => r.data);