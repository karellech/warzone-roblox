import { HttpService } from "@rbxts/services";

const API_BASE = "https://borax-ladybug-deluge.ngrok-free.dev/api";

function headers(): Record<string, string> {
    return {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    };
}

export const ApiService = {
    createMatch(playerCount: number): string | undefined {
        try {
            const response = HttpService.RequestAsync({
                Url: `${API_BASE}/matches/`,
                Method: "POST",
                Headers: headers(),
                Body: HttpService.JSONEncode({ player_count: playerCount }),
            });
            const data = HttpService.JSONDecode(response.Body) as { id: string };
            print(`[API] Partie créée : ${data.id}`);
            return data.id;
        } catch (e) {
            print(`[API] Erreur createMatch : ${e}`);
            return undefined;
        }
    },

    sendKillsBatch(matchId: string, kills: unknown[]): void {
        if (kills.size() === 0) return;
        try {
            HttpService.RequestAsync({
                Url: `${API_BASE}/matches/${matchId}/kills/`,
                Method: "POST",
                Headers: headers(),
                Body: HttpService.JSONEncode({ kills }),
            });
            print(`[API] ${kills.size()} kills envoyés`);
        } catch (e) {
            print(`[API] Erreur sendKillsBatch : ${e}`);
        }
    },

    endMatch(matchId: string, winningTeam: string, durationSeconds: number): void {
        try {
            HttpService.RequestAsync({
                Url: `${API_BASE}/matches/${matchId}/end/`,
                Method: "POST",
                Headers: headers(),
                Body: HttpService.JSONEncode({
                    winning_team: winningTeam,
                    duration_seconds: durationSeconds,
                }),
            });
            print(`[API] Partie terminée : ${winningTeam} gagne`);
        } catch (e) {
            print(`[API] Erreur endMatch : ${e}`);
        }
    },
};