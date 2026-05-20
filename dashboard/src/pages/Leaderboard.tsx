import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../services/api";
import { getLeaderboard, GRADE_COLORS } from "../services/api";

export default function Leaderboard() {
  const [all, setAll]       = useState<LeaderboardEntry[]>([]);
  const [filtered, setFiltered] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getLeaderboard(100)
      .then(d => { setAll(d); setFiltered(d); })
      .finally(() => setLoading(false));
  }, []);

  function filter(q: string) {
    setFiltered(q ? all.filter(p => p.username.toLowerCase().includes(q.toLowerCase())) : all);
  }

  const tdStyle = { padding: "13px 20px", fontSize: 13, borderBottom: "1px solid var(--border)" };
  const thStyle = {
    fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 2,
    color: "var(--muted)", textTransform: "uppercase" as const,
    padding: "12px 20px", textAlign: "left" as const,
    borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)",
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Classement Global</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              onChange={e => filter(e.target.value)}
              placeholder="Rechercher un joueur..."
              style={{
                background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6, padding: "6px 12px", color: "var(--text)",
                fontSize: 12, outline: "none", width: 200,
              }}
            />
            <span style={{
              fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px",
              borderRadius: 3, background: "rgba(255,45,45,0.15)", color: "var(--red)",
              border: "1px solid rgba(255,45,45,0.3)",
            }}>{filtered.length} joueurs</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>CHARGEMENT...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Joueur</th>
                <th style={thStyle}>Grade</th>
                <th style={thStyle}>Kills</th>
                <th style={thStyle}>Morts</th>
                <th style={thStyle}>K/D</th>
                <th style={thStyle}>Parties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", fontSize: 12 }}>AUCUN JOUEUR</td></tr>
              ) : filtered.map(p => (
                <tr key={p.roblox_user_id} style={{ transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: "'Share Tech Mono',monospace",
                      color: p.rank === 1 ? "var(--gold)" : p.rank === 2 ? "#C0C0C0" : p.rank === 3 ? "#CD7F32" : "var(--muted)",
                      fontSize: p.rank <= 3 ? 16 : 14,
                    }}>
                      {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : p.rank}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: "var(--bg4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700,
                        color: "var(--red)", border: "1px solid var(--border)", flexShrink: 0,
                      }}>{p.username[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{p.username}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: "'Share Tech Mono',monospace", fontSize: 9,
                      padding: "3px 8px", borderRadius: 3, textTransform: "uppercase",
                      ...(GRADE_COLORS[p.grade] ? {} : {}),
                    }}>
                      {p.grade === "Recrue"     && <span style={{ background: "rgba(107,122,141,0.2)", color: "#6B7A8D",        border: "1px solid rgba(107,122,141,0.3)", padding: "3px 8px", borderRadius: 3, fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{p.grade}</span>}
                      {p.grade === "Soldat"     && <span style={{ background: "rgba(45,142,255,0.15)", color: "var(--blue)",    border: "1px solid rgba(45,142,255,0.3)",  padding: "3px 8px", borderRadius: 3, fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{p.grade}</span>}
                      {p.grade === "Sergent"    && <span style={{ background: "rgba(255,184,0,0.15)",  color: "var(--gold)",    border: "1px solid rgba(255,184,0,0.3)",   padding: "3px 8px", borderRadius: 3, fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{p.grade}</span>}
                      {p.grade === "Lieutenant" && <span style={{ background: "rgba(156,111,255,0.15)",color: "var(--purple)",  border: "1px solid rgba(156,111,255,0.3)", padding: "3px 8px", borderRadius: 3, fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{p.grade}</span>}
                      {p.grade === "Général"    && <span style={{ background: "rgba(255,45,45,0.15)",  color: "var(--red)",     border: "1px solid rgba(255,45,45,0.3)",   padding: "3px 8px", borderRadius: 3, fontSize: 9, fontFamily: "'Share Tech Mono',monospace" }}>{p.grade}</span>}
                    </span>
                  </td>
                  <td style={tdStyle}><span style={{ color: "var(--green)", fontFamily: "'Share Tech Mono',monospace" }}>{p.total_kills}</span></td>
                  <td style={tdStyle}><span style={{ color: "var(--red)",   fontFamily: "'Share Tech Mono',monospace" }}>{p.total_deaths}</span></td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: "'Share Tech Mono',monospace", fontWeight: 700,
                      color: p.kd_ratio >= 2 ? "var(--green)" : p.kd_ratio >= 1 ? "var(--gold)" : "var(--red)",
                    }}>{p.kd_ratio.toFixed(2)}</span>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--muted)" }}>{p.total_matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}