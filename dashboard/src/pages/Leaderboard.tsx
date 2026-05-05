// src/pages/Leaderboard.tsx
import { useEffect, useState } from "react";
import { getLeaderboard, gradeColor, kdRatio } from "../services/api";
import type { LeaderboardEntry } from "../services/api";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    getLeaderboard(50)
      .then(setEntries)
      .catch(() => setError("Impossible de charger le classement."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-16">Chargement...</p>;
  if (error)   return <p className="text-center text-red-400 mt-16">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        🏆 Classement mondial
      </h1>

      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-700 text-gray-300 uppercase text-xs">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Joueur</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-right">Kills</th>
              <th className="px-4 py-3 text-right">Morts</th>
              <th className="px-4 py-3 text-right">K/D</th>
              <th className="px-4 py-3 text-right">Parties</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.roblox_user_id}
                className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
              >
                {/* Rang avec médaille pour le top 3 */}
                <td className="px-4 py-3 font-bold text-gray-400">
                  {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : e.rank}
                </td>

                <td className="px-4 py-3 font-semibold text-white">
                  {e.username}
                </td>

                {/* Badge de grade coloré */}
                <td className="px-4 py-3">
                  <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${gradeColor[e.grade] ?? "bg-gray-500"}`}>
                    {e.grade}
                  </span>
                </td>

                <td className="px-4 py-3 text-right text-green-400 font-mono">
                  {e.total_kills}
                </td>
                <td className="px-4 py-3 text-right text-red-400 font-mono">
                  {e.total_deaths}
                </td>
                <td className="px-4 py-3 text-right text-yellow-400 font-mono font-bold">
                  {kdRatio(e.total_kills, e.total_deaths)}
                </td>
                <td className="px-4 py-3 text-right text-gray-300 font-mono">
                  {e.total_matches}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            Aucun joueur enregistré pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
}