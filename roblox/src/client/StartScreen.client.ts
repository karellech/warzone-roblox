import { Players, ReplicatedStorage, UserInputService, RunService } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

const eventsFolder = ReplicatedStorage.WaitForChild("Events") as Folder;
const playClickedEvent = eventsFolder.WaitForChild("PlayClicked") as RemoteEvent;

const screenGui = new Instance("ScreenGui");
screenGui.Name = "StartScreen";
screenGui.ResetOnSpawn = false;
screenGui.DisplayOrder = 999;
screenGui.Parent = playerGui;

const background = new Instance("Frame");
background.Size = new UDim2(1, 0, 1, 0);
background.BackgroundColor3 = Color3.fromRGB(10, 10, 20);
background.Parent = screenGui;

const title = new Instance("TextLabel");
title.Size = new UDim2(0, 600, 0, 120);
title.Position = new UDim2(0.5, -300, 0.25, 0);
title.BackgroundTransparency = 1;
title.Text = "⚔️ WARZONE";
title.TextColor3 = Color3.fromRGB(255, 255, 255);
title.TextScaled = true;
title.Font = Enum.Font.GothamBold;
title.Parent = background;

const subtitle = new Instance("TextLabel");
subtitle.Size = new UDim2(0, 500, 0, 50);
subtitle.Position = new UDim2(0.5, -250, 0.45, 0);
subtitle.BackgroundTransparency = 1;
subtitle.Text = "Rouge vs Bleu — Qui gagnera ?";
subtitle.TextColor3 = Color3.fromRGB(180, 180, 180);
subtitle.TextScaled = true;
subtitle.Font = Enum.Font.Gotham;
subtitle.Parent = background;

const playButton = new Instance("TextButton");
playButton.Size = new UDim2(0, 250, 0, 70);
playButton.Position = new UDim2(0.5, -125, 0.6, 0);
playButton.BackgroundColor3 = Color3.fromRGB(220, 50, 50);
playButton.Text = "▶  JOUER";
playButton.TextColor3 = Color3.fromRGB(255, 255, 255);
playButton.TextScaled = true;
playButton.Font = Enum.Font.GothamBold;
playButton.Parent = background;

const corner = new Instance("UICorner");
corner.CornerRadius = new UDim(0, 12);
corner.Parent = playButton;

// ─── Fix souris : forcer le déverrouillage à chaque frame ─
const mouseConn = RunService.RenderStepped.Connect(() => {
    if (screenGui.Enabled) {
        UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
        UserInputService.MouseIconEnabled = true;
    }
});

playButton.MouseEnter.Connect(() => {
    playButton.BackgroundColor3 = Color3.fromRGB(255, 70, 70);
});
playButton.MouseLeave.Connect(() => {
    playButton.BackgroundColor3 = Color3.fromRGB(220, 50, 50);
});

playButton.MouseButton1Click.Connect(() => {
    mouseConn.Disconnect(); // Arrêter de forcer la souris
    screenGui.Enabled = false;
    UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
    UserInputService.MouseIconEnabled = false;
    playClickedEvent.FireServer();
});