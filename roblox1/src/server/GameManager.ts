import { Players, Teams, RunService } from "@rbxts/services";
import type { GameState, KillRecord, Team } from "../shared/types";
import { ApiService } from "./ApiService";

// ── Configuration ────────────────────────────────────────────
const LOBBY_DURATION  = 30;   // secondes d'attente avant le combat
const COMBAT_DURATION = 300;  // 5 minutes de combat
const END_DURATION    = 10;   // secondes d'affichage du résultat

// ── RemoteEvents (créés ici, écoutés côté client) ────────────
const ReplicatedStorage = game.GetService("ReplicatedStorage");

function getOrCreateRemote(name: string): RemoteEvent {
    const existing = ReplicatedStorage.FindFirstChild(name);
    if (existing) return existing as RemoteEvent;
    const remote = new Instance("RemoteEvent");
    remote.Name = name;
    remote.Parent = ReplicatedStorage;
    return remote;
}

const UpdateHUD    = getOrCreateRemote("UpdateHUD");
const GameEnded    = getOrCreateRemote("GameEnded");

// ── État global ──────────────────────────────────────────────
let state: GameState = "Lobby";
let kills: KillRecord[] = [];
let redKills  = 0;
let blueKills = 0;
let matchId: string | undefined;

// ── Fonctions utilitaires ────────────────────────────────────

function getTeam(teamName: string): Team {
    return teamName === "Red" ? "Red" : "Blue";
}

function broadcastHUD(timer: number) {
    UpdateHUD.FireAllClients(redKills, blueKills, timer, state);
}

function resetScores() {
    kills     = [];
    redKills  = 0;
    blueKills = 0;
    matchId   = undefined;
}

// ── Boucle de jeu ────────────────────────────────────────────

function runTimer(duration: number, onTick: (remaining: number) => void): void {
    let remaining = duration;
    while (remaining > 0) {
        onTick(remaining);
        wait(1);
        remaining -= 1;
    }
}

function startLobby(): void {
    state = "Lobby";
    resetScores();
    print("[WarZone] Phase Lobby démarrée");

    runTimer(LOBBY_DURATION, (t) => {
        broadcastHUD(t);
    });

    startCombat();
}

function startCombat(): void {
    state = "Combat";
    print("[WarZone] Phase Combat démarrée");

    // Créer la partie dans la BDD via API
    const players = Players.GetPlayers();
    matchId = ApiService.createMatch(players.size());

    runTimer(COMBAT_DURATION, (t) => {
        broadcastHUD(t);
    });

    endMatch();
}

function endMatch(): void {
    state = "End";

    const winner: Team = redKills > blueKills ? "Red"
                       : blueKills > redKills  ? "Blue"
                       : "Red"; // égalité → Red par défaut

    print(`[WarZone] Fin de partie — Gagnant : ${winner} (Rouge: ${redKills} / Bleu: ${blueKills})`);

    GameEnded.FireAllClients(winner, redKills, blueKills);

    if (matchId) {
        ApiService.sendKillsBatch(matchId, kills);
        ApiService.endMatch(matchId, winner, COMBAT_DURATION);
    }

    wait(END_DURATION);
    startLobby(); // boucle infinie
}

// ── Suivi des kills ──────────────────────────────────────────

export function registerKill(
    killer: Player,
    victim: Player,
    weapon: string
): void {
    if (state !== "Combat") return;

    const killerTeam = killer.Team ? getTeam(killer.Team.Name) : "Red";

    const record: KillRecord = {
        killerRobloxId:  killer.UserId,
        victimRobloxId:  victim.UserId,
        weapon,
        killerTeam,
        timestampOffset: 0, // simplifié pour l'instant
    };

    kills.push(record);

    if (killerTeam === "Red") {
        redKills += 1;
    } else {
        blueKills += 1;
    }

    broadcastHUD(0);
    print(`[WarZone] Kill: ${killer.Name} → ${victim.Name} (${weapon})`);

    // Vérifier si une équipe a atteint 30 kills
    if (redKills >= 30 || blueKills >= 30) {
        endMatch();
    }
}

// ── Démarrage ────────────────────────────────────────────────
print("[WarZone] Serveur démarré !");
startLobby();