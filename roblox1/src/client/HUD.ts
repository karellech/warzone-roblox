import { Players } from "@rbxts/services";

// ── Récupérer les RemoteEvents créés par le serveur ─────────
const ReplicatedStorage = game.GetService("ReplicatedStorage");

const UpdateHUD = ReplicatedStorage.WaitForChild("UpdateHUD") as RemoteEvent;
const GameEnded = ReplicatedStorage.WaitForChild("GameEnded") as RemoteEvent;

// ── Créer l'interface graphique ──────────────────────────────

const player       = Players.LocalPlayer;
const playerGui    = player.WaitForChild("PlayerGui") as PlayerGui;

// Conteneur principal
const screenGui    = new Instance("ScreenGui");
screenGui.Name     = "WarZoneHUD";
screenGui.ResetOnSpawn = false;
screenGui.Parent   = playerGui;

// ── Score des équipes (centre haut) ─────────────────────────
const scoreFrame        = new Instance("Frame");
scoreFrame.Size         = new UDim2(0, 300, 0, 50);
scoreFrame.Position     = new UDim2(0.5, -150, 0, 10);
scoreFrame.BackgroundTransparency = 0.4;
scoreFrame.BackgroundColor3 = new Color3(0, 0, 0);
scoreFrame.Parent       = screenGui;

const scoreLabel        = new Instance("TextLabel");
scoreLabel.Size         = new UDim2(1, 0, 1, 0);
scoreLabel.BackgroundTransparency = 1;
scoreLabel.TextColor3   = new Color3(1, 1, 1);
scoreLabel.TextScaled   = true;
scoreLabel.Font         = Enum.Font.GothamBold;
scoreLabel.Text         = "🔴 0 — 0 🔵";
scoreLabel.Parent       = scoreFrame;

// ── Timer (sous le score) ────────────────────────────────────
const timerLabel        = new Instance("TextLabel");
timerLabel.Size         = new UDim2(0, 200, 0, 35);
timerLabel.Position     = new UDim2(0.5, -100, 0, 65);
timerLabel.BackgroundTransparency = 0.4;
timerLabel.BackgroundColor3 = new Color3(0, 0, 0);
timerLabel.TextColor3   = new Color3(1, 1, 0);
timerLabel.TextScaled   = true;
timerLabel.Font         = Enum.Font.GothamBold;
timerLabel.Text         = "⏱ 30s";
timerLabel.Parent       = screenGui;

// ── Notification de fin de partie ───────────────────────────
const endLabel          = new Instance("TextLabel");
endLabel.Size           = new UDim2(0, 400, 0, 80);
endLabel.Position       = new UDim2(0.5, -200, 0.4, 0);
endLabel.BackgroundTransparency = 0.3;
endLabel.BackgroundColor3 = new Color3(0, 0, 0);
endLabel.TextColor3     = new Color3(1, 1, 1);
endLabel.TextScaled     = true;
endLabel.Font           = Enum.Font.GothamBold;
endLabel.Text           = "";
endLabel.Visible        = false;
endLabel.Parent         = screenGui;

// ── Mise à jour du HUD depuis le serveur ─────────────────────
UpdateHUD.OnClientEvent.Connect((
    redKills: number,
    blueKills: number,
    timer: number,
    state: string
) => {
    scoreLabel.Text = `🔴 ${redKills} — ${blueKills} 🔵`;

    if (state === "Lobby") {
        timerLabel.Text = `⏳ Début dans ${timer}s`;
        timerLabel.TextColor3 = new Color3(1, 1, 1);
    } else if (state === "Combat") {
        const minutes = math.floor(timer / 60);
        const seconds = timer % 60;
        const pad = seconds < 10 ? "0" : "";
        timerLabel.Text = `⏱ ${minutes}:${pad}${seconds}`;
        timerLabel.TextColor3 = timer <= 30
            ? new Color3(1, 0, 0)   // rouge si moins de 30s
            : new Color3(1, 1, 0);  // jaune sinon
    }
});

// ── Affichage de fin de partie ───────────────────────────────
GameEnded.OnClientEvent.Connect((
    winner: string,
    redKills: number,
    blueKills: number
) => {
    endLabel.Visible = true;
    endLabel.Text = winner === "Red"
        ? `🔴 ÉQUIPE ROUGE GAGNE !\n${redKills} — ${blueKills}`
        : `🔵 ÉQUIPE BLEUE GAGNE !\n${redKills} — ${blueKills}`;

    // Cacher après 8 secondes
    task.delay(8, () => {
        endLabel.Visible = false;
        endLabel.Text = "";
    });
});

print("[WarZone] HUD client chargé !");