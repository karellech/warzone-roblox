-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Players = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Players
local ApiService = TS.import(script, game:GetService("ServerScriptService"), "TS", "ApiService").ApiService
-- ── Configuration ────────────────────────────────────────────
local LOBBY_DURATION = 30
local COMBAT_DURATION = 300
local END_DURATION = 10
-- ── RemoteEvents (créés ici, écoutés côté client) ────────────
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local function getOrCreateRemote(name)
	local existing = ReplicatedStorage:FindFirstChild(name)
	if existing then
		return existing
	end
	local remote = Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = ReplicatedStorage
	return remote
end
local UpdateHUD = getOrCreateRemote("UpdateHUD")
local GameEnded = getOrCreateRemote("GameEnded")
-- ── État global ──────────────────────────────────────────────
local state = "Lobby"
local kills = {}
local redKills = 0
local blueKills = 0
local matchId
-- ── Fonctions utilitaires ────────────────────────────────────
local function getTeam(teamName)
	return if teamName == "Red" then "Red" else "Blue"
end
local function broadcastHUD(timer)
	UpdateHUD:FireAllClients(redKills, blueKills, timer, state)
end
local function resetScores()
	kills = {}
	redKills = 0
	blueKills = 0
	matchId = nil
end
-- ── Boucle de jeu ────────────────────────────────────────────
local function runTimer(duration, onTick)
	local remaining = duration
	while remaining > 0 do
		onTick(remaining)
		wait(1)
		remaining -= 1
	end
end
local startCombat
local function startLobby()
	state = "Lobby"
	resetScores()
	print("[WarZone] Phase Lobby démarrée")
	runTimer(LOBBY_DURATION, function(t)
		broadcastHUD(t)
	end)
	startCombat()
end
local endMatch
function startCombat()
	state = "Combat"
	print("[WarZone] Phase Combat démarrée")
	-- Créer la partie dans la BDD via API
	local players = Players:GetPlayers()
	matchId = ApiService:createMatch(#players)
	runTimer(COMBAT_DURATION, function(t)
		broadcastHUD(t)
	end)
	endMatch()
end
function endMatch()
	state = "End"
	local winner = if redKills > blueKills then "Red" elseif blueKills > redKills then "Blue" else "Red"
	print(`[WarZone] Fin de partie — Gagnant : {winner} (Rouge: {redKills} / Bleu: {blueKills})`)
	GameEnded:FireAllClients(winner, redKills, blueKills)
	if matchId ~= "" and matchId then
		ApiService:sendKillsBatch(matchId, kills)
		ApiService:endMatch(matchId, winner, COMBAT_DURATION)
	end
	wait(END_DURATION)
	startLobby()
end
-- ── Suivi des kills ──────────────────────────────────────────
local function registerKill(killer, victim, weapon)
	if state ~= "Combat" then
		return nil
	end
	local killerTeam = if killer.Team then getTeam(killer.Team.Name) else "Red"
	local record = {
		killerRobloxId = killer.UserId,
		victimRobloxId = victim.UserId,
		weapon = weapon,
		killerTeam = killerTeam,
		timestampOffset = 0,
	}
	table.insert(kills, record)
	if killerTeam == "Red" then
		redKills += 1
	else
		blueKills += 1
	end
	broadcastHUD(0)
	print(`[WarZone] Kill: {killer.Name} → {victim.Name} ({weapon})`)
	-- Vérifier si une équipe a atteint 30 kills
	if redKills >= 30 or blueKills >= 30 then
		endMatch()
	end
end
-- ── Démarrage ────────────────────────────────────────────────
print("[WarZone] Serveur démarré !")
startLobby()
return {
	registerKill = registerKill,
}
