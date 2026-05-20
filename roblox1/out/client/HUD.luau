-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Players = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Players
-- ── Récupérer les RemoteEvents créés par le serveur ─────────
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UpdateHUD = ReplicatedStorage:WaitForChild("UpdateHUD")
local GameEnded = ReplicatedStorage:WaitForChild("GameEnded")
-- ── Créer l'interface graphique ──────────────────────────────
local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
-- Conteneur principal
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "WarZoneHUD"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui
-- ── Score des équipes (centre haut) ─────────────────────────
local scoreFrame = Instance.new("Frame")
scoreFrame.Size = UDim2.new(0, 300, 0, 50)
scoreFrame.Position = UDim2.new(0.5, -150, 0, 10)
scoreFrame.BackgroundTransparency = 0.4
scoreFrame.BackgroundColor3 = Color3.new(0, 0, 0)
scoreFrame.Parent = screenGui
local scoreLabel = Instance.new("TextLabel")
scoreLabel.Size = UDim2.new(1, 0, 1, 0)
scoreLabel.BackgroundTransparency = 1
scoreLabel.TextColor3 = Color3.new(1, 1, 1)
scoreLabel.TextScaled = true
scoreLabel.Font = Enum.Font.GothamBold
scoreLabel.Text = "🔴 0 — 0 🔵"
scoreLabel.Parent = scoreFrame
-- ── Timer (sous le score) ────────────────────────────────────
local timerLabel = Instance.new("TextLabel")
timerLabel.Size = UDim2.new(0, 200, 0, 35)
timerLabel.Position = UDim2.new(0.5, -100, 0, 65)
timerLabel.BackgroundTransparency = 0.4
timerLabel.BackgroundColor3 = Color3.new(0, 0, 0)
timerLabel.TextColor3 = Color3.new(1, 1, 0)
timerLabel.TextScaled = true
timerLabel.Font = Enum.Font.GothamBold
timerLabel.Text = "⏱ 30s"
timerLabel.Parent = screenGui
-- ── Notification de fin de partie ───────────────────────────
local endLabel = Instance.new("TextLabel")
endLabel.Size = UDim2.new(0, 400, 0, 80)
endLabel.Position = UDim2.new(0.5, -200, 0.4, 0)
endLabel.BackgroundTransparency = 0.3
endLabel.BackgroundColor3 = Color3.new(0, 0, 0)
endLabel.TextColor3 = Color3.new(1, 1, 1)
endLabel.TextScaled = true
endLabel.Font = Enum.Font.GothamBold
endLabel.Text = ""
endLabel.Visible = false
endLabel.Parent = screenGui
-- ── Mise à jour du HUD depuis le serveur ─────────────────────
UpdateHUD.OnClientEvent:Connect(function(redKills, blueKills, timer, state)
	scoreLabel.Text = `🔴 {redKills} — {blueKills} 🔵`
	if state == "Lobby" then
		timerLabel.Text = `⏳ Début dans {timer}s`
		timerLabel.TextColor3 = Color3.new(1, 1, 1)
	elseif state == "Combat" then
		local minutes = math.floor(timer / 60)
		local seconds = timer % 60
		local pad = if seconds < 10 then "0" else ""
		timerLabel.Text = `⏱ {minutes}:{pad}{seconds}`
		timerLabel.TextColor3 = if timer <= 30 then Color3.new(1, 0, 0) else Color3.new(1, 1, 0)
	end
end)
-- ── Affichage de fin de partie ───────────────────────────────
GameEnded.OnClientEvent:Connect(function(winner, redKills, blueKills)
	endLabel.Visible = true
	endLabel.Text = if winner == "Red" then `🔴 ÉQUIPE ROUGE GAGNE !\n{redKills} — {blueKills}` else `🔵 ÉQUIPE BLEUE GAGNE !\n{redKills} — {blueKills}`
	-- Cacher après 8 secondes
	task.delay(8, function()
		endLabel.Visible = false
		endLabel.Text = ""
	end)
end)
print("[WarZone] HUD client chargé !")
return nil
