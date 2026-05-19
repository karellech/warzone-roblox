import { HttpService, Players, ReplicatedStorage } from "@rbxts/services";

const LOBBY_DURATION = 5;
const MATCH_DURATION = 20;
const API_URL = "https://factsheet-barmaid-festival.ngrok-free.dev";
const API_KEY = "warzone-secret-key";

const scores = new Map<string, number>();
let currentMatchId = "";

// Stocker les kills localement pendant le match
interface KillRecord {
    killer_roblox_id: string;
    victim_roblox_id: string;
    weapon: string;
}
const killsBuffer: KillRecord[] = [];

// RemoteEvent
const eventsFolder = new Instance("Folder");
eventsFolder.Name = "Events";
eventsFolder.Parent = ReplicatedStorage;

const updateHUDEvent = new Instance("RemoteEvent");
updateHUDEvent.Name = "UpdateHUD";
updateHUDEvent.Parent = eventsFolder;

// ─── API calls ────────────────────────────────────────────

function apiPost(endpoint: string, body: object): string {
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
        return response.Body;
    } catch (e) {
        print("API Error: " + e);
        return "";
    }
}

function createMatch(): string {
    const body = { 
        map_name: "Arena",
        player_count: Players.GetPlayers().size()
    };
    const response = apiPost("/api/matches/", body);
    if (response !== "") {
        try {
            const data = HttpService.JSONDecode(response) as { id: string };
            if (data && data.id) {
                print("Match créé : " + tostring(data.id));
                return tostring(data.id);
            } else {
                print("Réponse inattendue : " + response);
                return "";
            }
        } catch (e) {
            print("Erreur JSON : " + response);
            return "";
        }
    }
    return "";
}

function sendKillsBatch(matchId: string) {
    if (killsBuffer.size() === 0) return;
    const body = { kills: killsBuffer };
    apiPost("/api/matches/" + matchId + "/kills", body);
    print("Kills envoyés : " + killsBuffer.size());
}

function endMatch(matchId: string, winner: string, duration: number) {
    const body = { 
        winning_team: winner,
        duration_seconds: duration
    };
    apiPost("/api/matches/" + matchId + "/end", body);
    print("Match terminé : " + winner);
}

// ─── Game logic ───────────────────────────────────────────

function resetScores() {
    scores.set("Rouge", 0);
    scores.set("Bleu", 0);
    killsBuffer.clear();
}

function respawnAllPlayers() {
    Players.GetPlayers().forEach((player: Player) => {
        player.LoadCharacter();
    });
}

function connectPlayer(player: Player, connections: RBXScriptConnection[]) {
    const char = player.Character || player.CharacterAdded.Wait()[0];
    const humanoid = char.WaitForChild("Humanoid") as Humanoid;

    const conn = humanoid.Died.Connect(() => {
        const victimTeam = player.Team;
        if (!victimTeam) return;

        const killerTeamName = victimTeam.Name === "Rouge" ? "Bleu" : "Rouge";
        const current = scores.get(killerTeamName) ?? 0;
        scores.set(killerTeamName, current + 1);

        // Stocker le kill localement
        killsBuffer.push({
            killer_roblox_id: killerTeamName,
            victim_roblox_id: tostring(player.UserId),
            weapon: "default",
        });

        print(`Kill → équipe ${killerTeamName} : ${current + 1} kills`);

        const rouge = scores.get("Rouge") ?? 0;
        const bleu = scores.get("Bleu") ?? 0;
        updateHUDEvent.FireAllClients(rouge, bleu, "MATCH:0");

        task.delay(3, () => {
            player.LoadCharacter();
            task.delay(1, () => connectPlayer(player, connections));
        });
    });

    connections.push(conn);
}

function runLobby() {
    print("=== LOBBY : partie dans " + LOBBY_DURATION + "s ===");
    updateHUDEvent.FireAllClients(0, 0, "LOBBY");
    task.wait(LOBBY_DURATION);
}

function runMatch() {
    print("=== COMBAT COMMENCE ===");
    resetScores();

    // Créer la partie dans l'API
    currentMatchId = createMatch();

    respawnAllPlayers();

    const connections: RBXScriptConnection[] = [];

    Players.GetPlayers().forEach((player: Player) => {
        connectPlayer(player, connections);
    });

    const joinConn = Players.PlayerAdded.Connect((player: Player) => {
        connectPlayer(player, connections);
    });
    connections.push(joinConn);

    let timeLeft = MATCH_DURATION;
    while (timeLeft > 0) {
        task.wait(1);
        timeLeft -= 1;
        const rouge = scores.get("Rouge") ?? 0;
        const bleu = scores.get("Bleu") ?? 0;
        updateHUDEvent.FireAllClients(rouge, bleu, "MATCH:" + timeLeft);
    }

    connections.forEach((c) => c.Disconnect());
}

function runEnd() {
    const rouge = scores.get("Rouge") ?? 0;
    const bleu = scores.get("Bleu") ?? 0;

    let winner = "draw";
    let winnerDisplay = "Égalité";
    if (rouge > bleu) {
        winner = "Rouge";
        winnerDisplay = "Rouge";
    } else if (bleu > rouge) {
        winner = "Bleu";
        winnerDisplay = "Bleu";
    }

    print(`=== FIN : ${winnerDisplay} gagne | Rouge ${rouge} - Bleu ${bleu} ===`);
    updateHUDEvent.FireAllClients(rouge, bleu, "FIN:" + winnerDisplay);

    if (currentMatchId !== "") {
        sendKillsBatch(currentMatchId);
        endMatch(currentMatchId, winner, MATCH_DURATION);
    }

    task.wait(10);
}