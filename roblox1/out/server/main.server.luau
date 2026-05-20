-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Point d'entrée serveur — ce fichier s'exécute automatiquement
-- car il se termine par .server.ts → compilé en Script Roblox
TS.import(script, game:GetService("ServerScriptService"), "TS", "KillTracker")
-- GameManager démarre automatiquement à l'import via KillTracker
