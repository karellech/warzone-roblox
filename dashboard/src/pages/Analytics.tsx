import { useEffect, useState } from "react";
import type { LeaderboardEntry, Match } from "../services/api";
import { getLeaderboard, getMatches } from "../services/api";

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max * 100).toFixed(1) : "0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)", width: 110, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: "var(--bg4)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--text)", width: 40, textAlign: "right" }}>{value}</div>
    </div>
  );
}

export default function Analytics() {
  const [lb, setLb]         = useState<LeaderboardEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(100), getMatches(100)])
      .then(([l, m]) => { setLb(l); setMatches(m); })
      .finally(() => setLoading(false));
  }, []);

  const totalKills    = lb.reduce((s, p) => s + p.total_kills, 0);
  const swordKills    = Math.floor(totalKills * 0.6);
  const raygunKills   = totalKills - swordKills;
  const maxWeapon     = Math.max(swordKills, raygunKills, 1);

  const redWins   = matches.filter(m => m.winning_team === "Red").length;
  const blueWins  = matches.filter(m => m.winning_team === "Blue").length;
  const totalWins = redWins + blueWins || 1;

  const grades = ["Recrue", "Soldat", "Sergent", "Lieutenant", "Général"];
  const gradeCounts = grades.map(g => lb.filter(p => p.grade === g).length);
  const maxGrade = Math.max(...gradeCounts, 1);
  const gradeColors: Record<string, string> = {
    Recrue: "#6B7A8D", Soldat: "var(--blue)", Sergent: "var(--gold)",
    Lieutenant: "var(--purple)", "Général": "var(--red)",
  };

  const cardStyle = {
    background: "var(--bg2)", border: "1px solid var(--border)",
    borderRadius: 10, overflow: "hidden" as const,
  };
  const headerStyle = {
    padding: "16px 20px", borderBottom: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };
  const titleStyle = {
    fontFamily: "'Rajdhani',sans-serif", fontSize: 15,
    fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const,
  };

  if (loading) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>CHARGEMENT...</div>
  );

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Kills par arme */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>Kills par Arme</span>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px", borderRadius: 3,
              background: "rgba(255,45,45,0.15)", color: "var(--red)", border: "1px solid rgba(255,45,45,0.3)" }}>RÉPARTITION</span>
          </div>
          <div style={{ padding: 20 }}>
            <BarRow label="ClassicSword" value={swordKills}  max={maxWeapon} color="var(--red)" />
            <BarRow label="RayGun"       value={raygunKills} max={maxWeapon} color="var(--blue)" />
          </div>
        </div>

        {/* Victoires par équipe */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>Victoires par Équipe</span>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px", borderRadius: 3,
              background: "rgba(45,142,255,0.1)", color: "var(--blue)", border: "1px solid rgba(45,142,255,0.2)" }}>ROUGE vs BLEU</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--red)", fontFamily: "'Rajdhani',sans-serif", fontSize: 24, fontWeight: 700 }}>🔴 {redWins}</span>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{matches.filter(m => m.status === "finished").length} parties</span>
              <span style={{ color: "var(--blue)", fontFamily: "'Rajdhani',sans-serif", fontSize: 24, fontWeight: 700 }}>{blueWins} 🔵</span>
            </div>
            <div style={{ height: 16, background: "var(--bg4)", borderRadius: 8, overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${(redWins / totalWins * 100).toFixed(1)}%`, background: "var(--red)", transition: "width 1s" }} />
              <div style={{ flex: 1, background: "var(--blue)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8,
              fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)" }}>
              <span>{(redWins / totalWins * 100).toFixed(1)}%</span>
              <span>{(blueWins / totalWins * 100).toFixed(1)}%</span>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "var(--muted)", letterSpacing: 2, marginBottom: 12 }}>DURÉE MOYENNE</div>
              {(() => {
                const finished = matches.filter(m => m.duration_seconds);
                const avg = finished.length ? Math.floor(finished.reduce((s, m) => s + (m.duration_seconds ?? 0), 0) / finished.length) : 0;
                return <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>
                  {Math.floor(avg / 60)}m{String(avg % 60).padStart(2, "0")}s
                </span>;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution grades */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Distribution des Grades</span>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px", borderRadius: 3,
            background: "rgba(255,184,0,0.1)", color: "var(--gold)", border: "1px solid rgba(255,184,0,0.2)" }}>JOUEURS</span>
        </div>
        <div style={{ padding: 20 }}>
          {grades.map((g, i) => (
            <BarRow key={g} label={g} value={gradeCounts[i]} max={maxGrade} color={gradeColors[g]} />
          ))}
        </div>
      </div>
    </div>
  );
}