import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../services/api";
import { getLeaderboard } from "../services/api";

export default function Players() {
  const [all, setAll]           = useState<LeaderboardEntry[]>([]);
  const [filtered, setFiltered] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);

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
    fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2,
    color: "var(--muted)", textTransform: "uppercase" as const,
    padding: "12px 20px", textAlign: "left" as const,
    borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)",
  };

  function gradeBadge(grade: string) {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      Recrue:     { bg: "rgba(107,122,141,0.2)", color: "#6B7A8D",        border: "rgba(107,122,141,0.3)" },
      Soldat:     { bg: "rgba(45,142,255,0.15)",  color: "var(--blue)",   border: "rgba(45,142,255,0.3)" },
      Sergent:    { bg: "rgba(255,184,0,0.15)",   color: "var(--gold)",   border: "rgba(255,184,0,0.3)" },
      Lieutenant: { bg: "rgba(156,111,255,0.15)", color: "var(--purple)", border: "rgba(156,111,255,0.3)" },
      "Général":  { bg: "rgba(255,45,45,0.15)",   color: "var(--red)",    border: "rgba(255,45,45,0.3)" },
    };
    const s = styles[grade] ?? styles["Recrue"];
    return (
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "3px 8px",
        borderRadius: 3, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
        {grade}
      </span>
    );
  }

  return (
    <div style={{ padding: 32 }}>

      {/* Modal détail joueur */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
          backdropFilter: "blur(4px)",
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: "var(--bg2)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: 32, width: 420, position: "relative",
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={{
              position: "absolute", top: 16, right: 16, background: "none",
              border: "none", color: "var(--muted)", fontSize: 18, cursor: "pointer",
            }}>✕</button>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: "var(--bg4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Rajdhani',sans-serif", fontSize: 24, fontWeight: 700,
                color: "var(--red)", border: "1px solid var(--border)",
              }}>{selected.username[0].toUpperCase()}</div>
              <div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 700 }}>{selected.username}</div>
                <div style={{ marginTop: 4 }}>{gradeBadge(selected.grade)}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "KILLS",   value: selected.total_kills,   color: "var(--green)" },
                { label: "MORTS",   value: selected.total_deaths,  color: "var(--red)" },
                { label: "PARTIES", value: selected.total_matches,  color: "var(--blue)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: "var(--bg3)", borderRadius: 8, padding: 16,
                  border: "1px solid var(--border)", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "var(--muted)", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, background: "var(--bg3)", borderRadius: 8, padding: 16, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "var(--muted)", letterSpacing: 1, marginBottom: 8 }}>K/D RATIO</div>
              <div style={{
                fontFamily: "'Rajdhani',sans-serif", fontSize: 36, fontWeight: 700,
                color: selected.kd_ratio >= 2 ? "var(--green)" : selected.kd_ratio >= 1 ? "var(--gold)" : "var(--red)",
              }}>{selected.kd_ratio.toFixed(2)}</div>
            </div>

            <div style={{ marginTop: 12, fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
              Roblox ID : {selected.roblox_user_id}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Gestion des Joueurs</span>
          <input
            onChange={e => filter(e.target.value)}
            placeholder="Rechercher par username..."
            style={{
              background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6, padding: "6px 12px", color: "var(--text)",
              fontSize: 12, outline: "none", width: 240,
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>CHARGEMENT...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Joueur</th>
                <th style={thStyle}>Roblox ID</th>
                <th style={thStyle}>Grade</th>
                <th style={thStyle}>K / D</th>
                <th style={thStyle}>Parties</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", fontSize: 12 }}>AUCUN JOUEUR</td></tr>
              ) : filtered.map(p => (
                <tr key={p.roblox_user_id}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.15s" }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: "var(--bg4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700,
                        color: "var(--red)", border: "1px solid var(--border)", flexShrink: 0,
                      }}>{p.username[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{p.username}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)" }}>{p.roblox_user_id}</span>
                  </td>
                  <td style={tdStyle}>{gradeBadge(p.grade)}</td>
                  <td style={tdStyle}>
                    <span style={{ color: "var(--green)", fontFamily: "'Share Tech Mono',monospace" }}>{p.total_kills}</span>
                    <span style={{ color: "var(--muted)", margin: "0 4px" }}>/</span>
                    <span style={{ color: "var(--red)", fontFamily: "'Share Tech Mono',monospace" }}>{p.total_deaths}</span>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--muted)" }}>{p.total_matches}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setSelected(p)}
                      style={{
                        background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 6, padding: "4px 12px", color: "var(--muted)",
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", letterSpacing: 1, transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                    >DÉTAILS</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}