-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local HttpService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").HttpService
local API_BASE = "https://borax-ladybug-deluge.ngrok-free.dev/api"
local function headers()
	return {
		["Content-Type"] = "application/json",
		["ngrok-skip-browser-warning"] = "true",
	}
end
local ApiService = {
	createMatch = function(self, playerCount)
		local _exitType, _returns = TS.try(function()
			local response = HttpService:RequestAsync({
				Url = `{API_BASE}/matches/`,
				Method = "POST",
				Headers = headers(),
				Body = HttpService:JSONEncode({
					player_count = playerCount,
				}),
			})
			local data = HttpService:JSONDecode(response.Body)
			print(`[API] Partie créée : {data.id}`)
			return TS.TRY_RETURN, { data.id }
		end, function(e)
			print(`[API] Erreur createMatch : {e}`)
			return TS.TRY_RETURN, { nil }
		end)
		if _exitType then
			return unpack(_returns)
		end
	end,
	sendKillsBatch = function(self, matchId, kills)
		if #kills == 0 then
			return nil
		end
		TS.try(function()
			HttpService:RequestAsync({
				Url = `{API_BASE}/matches/{matchId}/kills/`,
				Method = "POST",
				Headers = headers(),
				Body = HttpService:JSONEncode({
					kills = kills,
				}),
			})
			print(`[API] {#kills} kills envoyés`)
		end, function(e)
			print(`[API] Erreur sendKillsBatch : {e}`)
		end)
	end,
	endMatch = function(self, matchId, winningTeam, durationSeconds)
		TS.try(function()
			HttpService:RequestAsync({
				Url = `{API_BASE}/matches/{matchId}/end/`,
				Method = "POST",
				Headers = headers(),
				Body = HttpService:JSONEncode({
					winning_team = winningTeam,
					duration_seconds = durationSeconds,
				}),
			})
			print(`[API] Partie terminée : {winningTeam} gagne`)
		end, function(e)
			print(`[API] Erreur endMatch : {e}`)
		end)
	end,
}
return {
	ApiService = ApiService,
}
