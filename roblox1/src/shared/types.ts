// Types partagés entre server et client

export type Team = "Red" | "Blue";

export type GameState = "Lobby" | "Combat" | "End";

export interface KillRecord {
    killerRobloxId: number;
    victimRobloxId: number;
    weapon: string;
    killerTeam: Team;
    timestampOffset: number;
}

export interface PlayerStats {
    kills: number;
    deaths: number;
}