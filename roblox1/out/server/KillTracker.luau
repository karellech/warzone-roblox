-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Players = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Players
local registerKill = TS.import(script, game:GetService("ServerScriptService"), "TS", "GameManager").registerKill
-- ── Suivi des dégâts par joueur ──────────────────────────────
-- On écoute l'événement Humanoid.Died pour détecter les morts
local function onCharacterAdded(character)
	local humanoid = character:WaitForChild("Humanoid")
	humanoid.Died:Connect(function()
		local victim = Players:GetPlayerFromCharacter(character)
		if not victim then
			return nil
		end
		-- Trouver le tueur via le tag "creator" placé par l'arme
		local creatorTag = humanoid:FindFirstChild("creator")
		if not creatorTag or not creatorTag.Value then
			return nil
		end
		local killer = creatorTag.Value
		if not killer or killer == victim then
			return nil
		end
		-- Récupérer le nom de l'arme depuis le tag
		local weaponTag = humanoid:FindFirstChild("weapon")
		local weapon = if weaponTag then weaponTag.Value else "Unknown"
		registerKill(killer, victim, weapon)
	end)
end
-- Écouter les nouveaux personnages pour tous les joueurs
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		onCharacterAdded(character)
	end)
end)
print("[WarZone] KillTracker actif !")
return nil
