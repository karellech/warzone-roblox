// src/pages/MatchHistory.tsx
import { useEffect, useState } from "react";
import { getMatches } from "../services/api";
import type { Match } from "../services/api";

function teamBadge(team: string | null) {
  if (team === "Red")  return <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">🔴 Rouge</span>;
  if (team === "Blue") return <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">🔵 Bleu</span>;
  if (team === "Draw") return <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">⚖ Égalité</span>;
  return <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full">En cours</span>;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches(30).then(setMatches).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-16">Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">📋 Historique des parties</h1>

      <div className="space-y-3">
        {matches.map((m) => (
          <div key={m.id} className="bg-gray-800 rounded-xl px-6 py-4 flex items-center justify-between shadow">
            <div>
              <p className="text-white font-semibold">{formatDate(m.started_at)}</p>
              <p className="text-gray-400 text-sm mt-1">
                Durée : {formatDuration(m.duration_seconds)}
                <span className="mx-2 text-gray-600">|</span>
                ID : <span className="font-mono text-xs">{m.id.slice(0, 8)}…</span>
              </p>
            </div>
            <div className="text-right">
              {teamBadge(m.winning_team)}
              <p className="text-gray-500 text-xs mt-1">
                {m.status === "ongoing" ? "🟢 En cours" : "✅ Terminée"}
              </p>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <p className="text-center text-gray-500 py-12">Aucune partie jouée pour l'instant.</p>
        )}
      </div>
    </div>
  );
}