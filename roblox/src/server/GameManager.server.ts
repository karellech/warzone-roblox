import { Players, ReplicatedStorage } from "@rbxts/services";

const LOBBY_DURATION = 30;
const MATCH_DURATION = 300;

const scores = new Map<string, number>();

// Créer le RemoteEvent
const eventsFolder = new Instance("Folder");
eventsFolder.Name = "Events";
eventsFolder.Parent = ReplicatedStorage;

const updateHUDEvent = new Instance("RemoteEvent");
updateHUDEvent.Name = "UpdateHUD";
updateHUDEvent.Parent = eventsFolder;

function resetScores() {
    scores.set("Rouge", 0);
    scores.set("Bleu", 0);
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

    let winner = "Égalité";
    if (rouge > bleu) winner = "Rouge";
    else if (bleu > rouge) winner = "Bleu";

    print(`=== FIN : ${winner} gagne | Rouge ${rouge} - Bleu ${bleu} ===`);
    updateHUDEvent.FireAllClients(rouge, bleu, "FIN:" + winner);
    task.wait(10);
}

while (true) {
    runLobby();
    runMatch();
    runEnd();
}