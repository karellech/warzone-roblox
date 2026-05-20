import { useEffect, useState } from "react";
import type { LeaderboardEntry, Match } from "../services/api";
import { getLeaderboard, getMatches, formatDate, formatDuration, GRADE_COLORS } from "../services/api";

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 800;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{value}</>;
}

function StatCard({ label, value, color, sub }: {
  label: string; value: number; color: string; sub: string;
}) {
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 60, height: 60,
        borderRadius: "0 10px 0 60px", background: color, opacity: 0.06,
      }} />
      <div style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
        letterSpacing: 2, color: "var(--muted)", marginBottom: 10,
        textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: 36,
        fontWeight: 700, color, lineHeight: 1, marginBottom: 6,
      }}>
        <AnimatedNumber target={value} />
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</div>
    </div>
  );
}

export default function Overview() {
  const [lb, setLb]       = useState<LeaderboardEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(100), getMatches(50)])
      .then(([l, m]) => { setLb(l); setMatches(m); })
      .finally(() => setLoading(false));
  }, []);

  const totalKills  = lb.reduce((s, p) => s + p.total_kills, 0);
  const ongoingCount = matches.filter(m => m.status === "ongoing").length;

  if (loading) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--muted)",
      fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2 }}>
      CHARGEMENT...
    </div>
  );

  return (
    <div style={{ padding: 32 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Joueurs" value={lb.length}      color="var(--red)"   sub="inscrits en base" />
        <StatCard label="Parties jouées" value={matches.length} color="var(--blue)"  sub="toutes sessions" />
        <StatCard label="Total Kills"    value={totalKills}     color="var(--gold)"  sub="enregistrés" />
        <StatCard label="En cours"       value={ongoingCount}   color="var(--green)" sub="parties actives" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top 5 */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Top 5 Joueurs</span>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px", borderRadius: 3,
              background: "rgba(255,184,0,0.1)", color: "var(--gold)", border: "1px solid rgba(255,184,0,0.2)" }}>KILLS</span>
          </div>
          {lb.slice(0, 5).map((p, i) => (
            <div key={p.roblox_user_id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 20px", borderBottom: "1px solid var(--border)",
            }}>
              <div style={{
                fontFamily: "'Share Tech Mono',monospace", fontSize: i < 3 ? 16 : 14,
                color: i === 0 ? "var(--gold)" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--muted)",
                width: 24,
              }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: "var(--bg4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 700,
                color: "var(--red)", border: "1px solid var(--border)",
              }}>{p.username[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.username}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{p.total_matches} parties</div>
              </div>
              <span className={`grade grade-${p.grade}`} style={{
                fontFamily: "'Share Tech Mono',monospace", fontSize: 9,
                padding: "3px 8px", borderRadius: 3, textTransform: "uppercase",
                ...({} as Record<string, string>),
              }}>
                <span style={{
                  background: GRADE_COLORS[p.grade]?.split(" ")[1] ?? "",
                  padding: "3px 8px", borderRadius: 3, fontSize: 9,
                  fontFamily: "'Share Tech Mono',monospace",
                  color: i === 0 ? "var(--gold)" : i === 1 ? "var(--purple)" : i === 2 ? "var(--blue)" : "var(--muted)",
                }}>{p.grade}</span>
              </span>
              <div style={{ color: "var(--green)", fontFamily: "'Share Tech Mono',monospace", fontSize: 16, fontWeight: 700 }}>
                {p.total_kills}
              </div>
            </div>
          ))}
          {lb.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", fontSize: 12 }}>AUCUN JOUEUR</div>}
        </div>

        {/* Dernières parties */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Dernières Parties</span>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px", borderRadius: 3,
              background: "rgba(45,142,255,0.1)", color: "var(--blue)", border: "1px solid rgba(45,142,255,0.2)" }}>RÉCENT</span>
          </div>
          {matches.slice(0, 6).map(m => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "13px 20px", borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)", width: 80 }}>
                #{m.id.slice(0, 8)}
              </div>
              <div style={{ flex: 1 }}>
                {m.winning_team ? (
                  <span style={{
                    fontFamily: "'Share Tech Mono',monospace", fontSize: 9,
                    padding: "3px 8px", borderRadius: 3,
                    background: m.winning_team === "Red" ? "rgba(255,45,45,0.15)" : m.winning_team === "Blue" ? "rgba(45,142,255,0.15)" : "rgba(107,122,141,0.15)",
                    color: m.winning_team === "Red" ? "var(--red)" : m.winning_team === "Blue" ? "var(--blue)" : "var(--muted)",
                    border: `1px solid ${m.winning_team === "Red" ? "rgba(255,45,45,0.3)" : m.winning_team === "Blue" ? "rgba(45,142,255,0.3)" : "rgba(107,122,141,0.3)"}`,
                  }}>
                    {m.winning_team === "Red" ? "🔴 ROUGE" : m.winning_team === "Blue" ? "🔵 BLEU" : "⚖ ÉGAL"}
                  </span>
                ) : (
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "3px 8px", borderRadius: 3,
                    background: "rgba(0,230,118,0.1)", color: "var(--green)", border: "1px solid rgba(0,230,118,0.2)" }}>● EN COURS</span>
                )}
              </div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)" }}>
                {formatDuration(m.duration_seconds)}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
                {formatDate(m.started_at)}
              </div>
            </div>
          ))}
          {matches.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", fontSize: 12 }}>AUCUNE PARTIE</div>}
        </div>
      </div>
    </div>
  );
}