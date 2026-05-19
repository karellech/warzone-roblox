import axios from "axios";
import type { AxiosResponse } from "axios";

// L'URL vient du fichier .env.local
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 8000,
});

// ── Types TypeScript ────────────────────────────────────────
// Miroir exact des schemas Pydantic du backend

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

export interface Match {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  winning_team: string | null;
  status: "ongoing" | "finished";
}

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

// ── Helpers ─────────────────────────────────────────────────

export const GRADE_COLORS: Record<string, string> = {
  Recrue:     "text-gray-400 bg-gray-800 border-gray-700",
  Soldat:     "text-blue-400 bg-blue-950 border-blue-800",
  Sergent:    "text-yellow-400 bg-yellow-950 border-yellow-800",
  Lieutenant: "text-purple-400 bg-purple-950 border-purple-800",
  "Général":  "text-red-400 bg-red-950 border-red-800",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatDuration(s: number | null): string {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}

// ── Appels API ───────────────────────────────────────────────

export const getLeaderboard = (limit = 100) =>
  api.get<LeaderboardEntry[]>(`/api/leaderboard/?limit=${limit}`)
     .then(({ data }: AxiosResponse<LeaderboardEntry[]>) => data);

export const getMatches = (limit = 50) =>
  api.get<Match[]>(`/api/matches/?limit=${limit}`)
     .then(({ data }: AxiosResponse<Match[]>) => data);

export const createPlayer = (roblox_user_id: number, username: string) =>
  api.post<Player>("/api/players/", { roblox_user_id, username })
     .then(({ data }: AxiosResponse<Player>) => data);

export const createMatch = (player_count: number) =>
  api.post<Match>("/api/matches/", { player_count })
     .then(({ data }: AxiosResponse<Match>) => data);

export const checkApi = () =>
  api.get("/").then(() => true).catch(() => false);