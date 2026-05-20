import { Players, ReplicatedStorage } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

const screenGui = new Instance("ScreenGui");
screenGui.Name = "HUD";
screenGui.ResetOnSpawn = false;
screenGui.Parent = playerGui;

// Score
const scoreFrame = new Instance("Frame");
scoreFrame.Size = new UDim2(0, 220, 0, 50);
scoreFrame.Position = new UDim2(0.5, -110, 0, 10);
scoreFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
scoreFrame.BackgroundTransparency = 0.5;
scoreFrame.Parent = screenGui;

const scoreLabel = new Instance("TextLabel");
scoreLabel.Size = new UDim2(1, 0, 1, 0);
scoreLabel.BackgroundTransparency = 1;
scoreLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
scoreLabel.TextScaled = true;
scoreLabel.Text = "Rouge 0 - 0 Bleu";
scoreLabel.Font = Enum.Font.GothamBold;
scoreLabel.Parent = scoreFrame;

// Timer / Status
const statusFrame = new Instance("Frame");
statusFrame.Size = new UDim2(0, 150, 0, 40);
statusFrame.Position = new UDim2(0.5, -75, 0, 65);
statusFrame.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
statusFrame.BackgroundTransparency = 0.5;
statusFrame.Parent = screenGui;

const statusLabel = new Instance("TextLabel");
statusLabel.Size = new UDim2(1, 0, 1, 0);
statusLabel.BackgroundTransparency = 1;
statusLabel.TextColor3 = Color3.fromRGB(255, 255, 0);
statusLabel.TextScaled = true;
statusLabel.Text = "En attente...";
statusLabel.Font = Enum.Font.GothamBold;
statusLabel.Parent = statusFrame;

// Écouter le serveur
const eventsFolder = ReplicatedStorage.WaitForChild("Events");
const updateHUDEvent = eventsFolder.WaitForChild("UpdateHUD") as RemoteEvent;

updateHUDEvent.OnClientEvent.Connect((rouge: number, bleu: number, state: string) => {
    scoreLabel.Text = `Rouge ${rouge} - ${bleu} Bleu`;

    if (state === "LOBBY") {
        statusLabel.Text = "⏳ Lobby...";
        statusLabel.TextColor3 = Color3.fromRGB(255, 255, 0);
    } else if (state.sub(1, 5) === "MATCH") {
        const parts = state.split(":");
        const timeLeft = tonumber(parts[1]) ?? 0;
        const mins = math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const secsStr = secs < 10 ? "0" + tostring(secs) : tostring(secs);
        statusLabel.Text = `⚔️ ${mins}:${secsStr}`;
        statusLabel.TextColor3 = Color3.fromRGB(255, 100, 100);
    } else if (state.sub(1, 3) === "FIN") {
        const winner = state.split(":")[1];
        statusLabel.Text = `🏆 ${winner} gagne !`;
        statusLabel.TextColor3 = Color3.fromRGB(100, 255, 100);
    }
});