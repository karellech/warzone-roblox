import { HttpService, Players, ReplicatedStorage, Teams } from "@rbxts/services";

const LOBBY_DURATION = 15;
const MATCH_DURATION = 20;
const RESPAWN_DELAY = 3;
const API_URL = "https://factsheet-barmaid-festival.ngrok-free.dev";
const API_KEY = "warzone-secret-key";

const scores = new Map<string, number>();
let currentMatchId = "";
let matchRunning = false;
let waitingForPlayers = false;
let soloMode = false;
const MIN_PLAYERS_TO_MATCH = 2;

// ─── Types ────────────────────────────────────────────────

interface KillRecord {
    killer_roblox_id: string;
    victim_roblox_id: string;
    weapon: string;
}

// ─── Buffers & connexions actives ─────────────────────────

const killsBuffer: KillRecord[] = [];
const activeConnections: RBXScriptConnection[] = [];

// ─── RemoteEvents ─────────────────────────────────────────

let eventsFolder = ReplicatedStorage.FindFirstChild("Events") as Folder | undefined;
if (!eventsFolder) {
    eventsFolder = new Instance("Folder");
    eventsFolder.Name = "Events";
    eventsFolder.Parent = ReplicatedStorage;
}

let updateHUDEvent = eventsFolder.FindFirstChild("UpdateHUD") as RemoteEvent | undefined;
if (!updateHUDEvent) {
    updateHUDEvent = new Instance("RemoteEvent");
    updateHUDEvent.Name = "UpdateHUD";
    updateHUDEvent.Parent = eventsFolder;
}

let gameStateEvent = eventsFolder.FindFirstChild("GameStateChanged") as RemoteEvent | undefined;
if (!gameStateEvent) {
    gameStateEvent = new Instance("RemoteEvent");
    gameStateEvent.Name = "GameStateChanged";
    gameStateEvent.Parent = eventsFolder;
}

let playClickedEvent = eventsFolder.FindFirstChild("PlayClicked") as RemoteEvent | undefined;
if (!playClickedEvent) {
    playClickedEvent = new Instance("RemoteEvent");
    playClickedEvent.Name = "PlayClicked";
    playClickedEvent.Parent = eventsFolder;
}

// ─── Helpers ──────────────────────────────────────────────

function fireHUD(rouge: number, bleu: number, state: string) {
    updateHUDEvent!.FireAllClients(rouge, bleu, state);
}

function startMatchCountdown() {
    if (matchRunning || waitingForPlayers) {
        return;
    }

    waitingForPlayers = true;
    soloMode = false;
    task.spawn(() => {
        runLobby();
        waitingForPlayers = false;

        const playerCount = Players.GetPlayers().size();
        print(`=== DÉCOMPTE TERMINÉ : ${playerCount} joueur(s) présents ===`);

        if (playerCount >= MIN_PLAYERS_TO_MATCH) {
            runMatch();
            runEnd();
            return;
        }

        print("=== MODE SOLO : seul joueur, partie non lancée ===");
        fireHUD(0, 0, "SOLO");
        soloMode = true;
        respawnAllPlayers();
    });
}

function clearBuffer() {
    while (killsBuffer.size() > 0) {
        killsBuffer.pop();
    }
}

function clearConnections() {
    activeConnections.forEach((c) => c.Disconnect());
    while (activeConnections.size() > 0) {
        activeConnections.pop();
    }
}

// ─── API calls ────────────────────────────────────────────

function apiPost(endpoint: string, body: object): unknown | undefined {
    try {
        const response = HttpService.RequestAsync({
            Url: API_URL + endpoint,
            Method: "POST",
            Headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY,
                "ngrok-skip-browser-warning": "true",
            },
            Body: HttpService.JSONEncode(body),
        });

        if (response.Success && response.Body !== "") {
            return HttpService.JSONDecode(response.Body);
        } else {
            warn(`API [${endpoint}] HTTP ${response.StatusCode}: ${response.Body}`);
        }
    } catch (e) {
        warn(`API [${endpoint}] Exception: ${e}`);
    }
    return undefined;
}

function createMatch(): string {
    const data = apiPost("/api/matches/", {
        map_name: "Arena",
        player_count: Players.GetPlayers().size(),
    }) as { id: string } | undefined;

    if (data && data.id) {
        print("Match créé : " + tostring(data.id));
        return tostring(data.id);
    }
    warn("Impossible de créer le match via l'API.");
    return "";
}

function sendKillsBatch(matchId: string) {
    if (killsBuffer.size() === 0) {
        print("Aucun kill à envoyer.");
        return;
    }
    apiPost("/api/matches/" + matchId + "/kills", { kills: killsBuffer });
    print(`Kills envoyés : ${killsBuffer.size()}`);
}

function endMatch(matchId: string, winner: string, duration: number) {
    apiPost("/api/matches/" + matchId + "/end", {
        winning_team: winner,
        duration_seconds: duration,
    });
    print("Match terminé, gagnant : " + winner);
}

// ─── Spawn logic ──────────────────────────────────────────

function getSpawnForTeam(teamName: string): SpawnLocation | undefined {
    const workspace = game.GetService("Workspace");
    const spawnName = teamName === "Rouge" ? "SpawnLocation-red" : "SpawnLocation-blue";
    return workspace.FindFirstChild(spawnName) as SpawnLocation | undefined;
}

function teleportToSpawn(player: Player) {
    // Petit délai pour laisser le personnage se charger
    task.delay(0.15, () => {
        const char = player.Character;
        if (!char) return;
        const root = char.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
        const spawn = getSpawnForTeam(player.Team?.Name ?? "");
        if (root && spawn) {
            root.CFrame = spawn.CFrame.add(new Vector3(0, 3, 0));
        }
    });
}

function respawnPlayerAtSpawn(player: Player) {
    player.LoadCharacter();
    teleportToSpawn(player);
}

function respawnAllPlayers() {
    Players.GetPlayers().forEach((player) => respawnPlayerAtSpawn(player));
}

// ─── Kill tracking ────────────────────────────────────────

function getKillerId(victim: Player): string {
    // Tente de trouver le vrai tueur via le tag "creator"
    const char = victim.Character;
    if (char) {
        const tag = char.FindFirstChild("creator") as ObjectValue | undefined;
        if (tag && tag.Value) {
            const killer = tag.Value as Player;
            if (killer && killer !== victim) {
                return tostring(killer.UserId);
            }
        }
    }
    // Fallback : on retourne l'équipe adverse (comportement original)
    const enemyTeamName = victim.Team?.Name === "Rouge" ? "Bleu" : "Rouge";
    return enemyTeamName;
}

function connectPlayer(player: Player) {
    const char = player.Character || player.CharacterAdded.Wait()[0];
    const humanoid = char.WaitForChild("Humanoid") as Humanoid;

    const conn = humanoid.Died.Connect(() => {
        if (!matchRunning) return;

        const victimTeam = player.Team;

        // ─── Debug : afficher le nom de l'équipe ──────────
        print(`[KILL] Victime: ${player.Name} | Équipe: ${victimTeam?.Name ?? "AUCUNE"}`);

        // Vérification stricte des noms d'équipe
        if (!victimTeam) {
            warn(`${player.Name} n'a pas d'équipe assignée — kill ignoré`);
            return;
        }

        const victimTeamName = victimTeam.Name;
        if (victimTeamName !== "Rouge" && victimTeamName !== "Bleu") {
            warn(`Nom d'équipe inconnu: "${victimTeamName}" — kill ignoré`);
            return;
        }

        const killerTeamName = victimTeamName === "Rouge" ? "Bleu" : "Rouge";
        const current = scores.get(killerTeamName) ?? 0;
        scores.set(killerTeamName, current + 1);

        killsBuffer.push({
            killer_roblox_id: getKillerId(player),
            victim_roblox_id: tostring(player.UserId),
            weapon: "default",
        });

        print(`[KILL] +1 pour ${killerTeamName} → total: ${current + 1}`);

        const rouge = scores.get("Rouge") ?? 0;
        const bleu = scores.get("Bleu") ?? 0;
        fireHUD(rouge, bleu, "MATCH:0");

        task.delay(RESPAWN_DELAY, () => {
            if (!matchRunning) return;
            respawnPlayerAtSpawn(player);
            task.delay(0.5, () => {
                if (matchRunning) connectPlayer(player);
            });
        });
    });

    activeConnections.push(conn);
}
// ─── Phases du jeu ───────────────────────────────────────

function runLobby() {
    print(`=== LOBBY : partie dans ${LOBBY_DURATION}s ===`);
    fireHUD(0, 0, "LOBBY");
    task.wait(LOBBY_DURATION);
}

function runMatch() {
    print("=== COMBAT COMMENCE ===");

    // Reset
    scores.set("Rouge", 0);
    scores.set("Bleu", 0);
    clearBuffer();
    clearConnections();
    matchRunning = true;

    currentMatchId = createMatch();

    respawnAllPlayers();

    // Connecter tous les joueurs présents
    Players.GetPlayers().forEach((player) => connectPlayer(player));

    // Connecter les joueurs qui rejoignent en cours de match
    const joinConn = Players.PlayerAdded.Connect((player) => {
        if (matchRunning) connectPlayer(player);
    });
    activeConnections.push(joinConn);

    // Boucle de temps
    let timeLeft = MATCH_DURATION;
    while (timeLeft > 0) {
        task.wait(1);
        timeLeft -= 1;
        const rouge = scores.get("Rouge") ?? 0;
        const bleu = scores.get("Bleu") ?? 0;
        fireHUD(rouge, bleu, `MATCH:${timeLeft}`);
    }

    matchRunning = false;
    clearConnections();
}

function runEnd() {
    const rouge = scores.get("Rouge") ?? 0;
    const bleu = scores.get("Bleu") ?? 0;

    let winner: string;
    let winnerDisplay: string;

    if (rouge > bleu) {
        winner = "Rouge";
        winnerDisplay = "Rouge";
    } else if (bleu > rouge) {
        winner = "Bleu";
        winnerDisplay = "Bleu";
    } else {
        winner = "draw";
        winnerDisplay = "Égalité";
    }

    print(`=== FIN : ${winnerDisplay} gagne | Rouge ${rouge} – Bleu ${bleu} ===`);
    fireHUD(rouge, bleu, `FIN:${winnerDisplay}`);

    if (currentMatchId !== "") {
        sendKillsBatch(currentMatchId);
        endMatch(currentMatchId, winner, MATCH_DURATION);
        currentMatchId = "";
    }

    task.wait(10);
}

playClickedEvent!.OnServerEvent.Connect((player: Player) => {
    print(`${player.Name} a appuyé sur JOUER`);
    startMatchCountdown();
});

Players.PlayerAdded.Connect(() => {
    if (!matchRunning && !waitingForPlayers && soloMode && Players.GetPlayers().size() >= MIN_PLAYERS_TO_MATCH) {
        print("=== Deuxième joueur arrivé en mode solo, relance le lobby ===");
        startMatchCountdown();
    }
});