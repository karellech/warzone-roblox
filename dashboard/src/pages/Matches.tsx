import { useEffect, useState } from "react";
import type { Match } from "../services/api";
import { getMatches, formatDate, formatDuration } from "../services/api";

export default function Matches() {
  const [all, setAll]           = useState<Match[]>([]);
  const [filtered, setFiltered] = useState<Match[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMatches(50)
      .then(d => { setAll(d); setFiltered(d); })
      .finally(() => setLoading(false));
  }, []);

  function filter(status: string) {
    setFiltered(status === "all" ? all : all.filter(m => m.status === status));
  }

  function teamBadge(m: Match) {
    if (!m.winning_team) return (
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "3px 8px", borderRadius: 3,
        background: "rgba(0,230,118,0.1)", color: "var(--green)", border: "1px solid rgba(0,230,118,0.2)" }}>● EN COURS</span>
    );
    const isRed  = m.winning_team === "Red";
    const isBlue = m.winning_team === "Blue";
    return (
      <span style={{
        fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "3px 8px", borderRadius: 3,
        background: isRed ? "rgba(255,45,45,0.15)" : isBlue ? "rgba(45,142,255,0.15)" : "rgba(107,122,141,0.15)",
        color: isRed ? "var(--red)" : isBlue ? "var(--blue)" : "var(--muted)",
        border: `1px solid ${isRed ? "rgba(255,45,45,0.3)" : isBlue ? "rgba(45,142,255,0.3)" : "rgba(107,122,141,0.3)"}`,
      }}>
        {isRed ? "🔴 ROUGE GAGNE" : isBlue ? "🔵 BLEU GAGNE" : "⚖ ÉGALITÉ"}
      </span>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Historique des Parties</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              onChange={e => filter(e.target.value)}
              style={{
                background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6, padding: "6px 12px", color: "var(--text)",
                fontSize: 12, outline: "none",
              }}
            >
              <option value="all">Toutes</option>
              <option value="ongoing">En cours</option>
              <option value="finished">Terminées</option>
            </select>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px",
              borderRadius: 3, background: "rgba(45,142,255,0.1)", color: "var(--blue)",
              border: "1px solid rgba(45,142,255,0.2)",
            }}>{filtered.length} parties</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>CHARGEMENT...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", fontSize: 12 }}>AUCUNE PARTIE</div>
        ) : filtered.map(m => (
          <div key={m.id}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)", width: 90, flexShrink: 0 }}>
              #{m.id.slice(0, 8)}
            </div>
            <div style={{ flex: 1 }}>{teamBadge(m)}</div>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              <span style={{
                fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "3px 8px", borderRadius: 3,
                background: m.status === "ongoing" ? "rgba(0,230,118,0.1)" : "rgba(107,122,141,0.1)",
                color: m.status === "ongoing" ? "var(--green)" : "var(--muted)",
                border: `1px solid ${m.status === "ongoing" ? "rgba(0,230,118,0.2)" : "rgba(107,122,141,0.2)"}`,
              }}>{m.status === "ongoing" ? "LIVE" : "TERMINÉE"}</span>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)", width: 60, textAlign: "center" }}>
              {formatDuration(m.duration_seconds)}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "right", width: 130, flexShrink: 0 }}>
              {formatDate(m.started_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}