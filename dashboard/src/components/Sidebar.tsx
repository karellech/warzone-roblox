import { NavLink } from "react-router-dom";

const links = [
  { to: "/",           icon: "⬡", label: "Tableau de bord",  section: null },
  { to: "/leaderboard",icon: "▲", label: "Classement",        section: "Statistiques" },
  { to: "/matches",    icon: "◈", label: "Parties",           section: null },
  { to: "/analytics",  icon: "◎", label: "Analytics",         section: null },
  { to: "/players",    icon: "◉", label: "Joueurs",           section: "Administration" },
  { to: "/admin",      icon: "⬟", label: "Panel Admin",       section: null },
];

interface Props {
  onLogout: () => void;
  apiOnline: boolean;
}

export default function Sidebar({ onLogout, apiOnline }: Props) {
  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 240,
      background: "var(--bg2)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700,
          letterSpacing: 4, textTransform: "uppercase",
          background: "linear-gradient(135deg, var(--red), #FF8C00)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>⚔ WARZONE</div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
          color: "var(--muted)", letterSpacing: 2, marginTop: 2,
        }}>ADMIN CONSOLE v1.0</div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {links.map((link) => (
          <div key={link.to}>
            {link.section && (
              <div style={{
                fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
                letterSpacing: 2, color: "var(--muted)",
                padding: "12px 12px 6px", textTransform: "uppercase",
              }}>{link.section}</div>
            )}
            <NavLink
              to={link.to}
              end={link.to === "/"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 6, cursor: "pointer",
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                marginBottom: 2, transition: "all 0.2s",
                color: isActive ? "var(--text)" : "var(--muted)",
                background: isActive ? "rgba(255,45,45,0.08)" : "transparent",
                border: isActive ? "1px solid rgba(255,45,45,0.2)" : "1px solid transparent",
                borderLeft: isActive ? "3px solid var(--red)" : "1px solid transparent",
              })}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{link.icon}</span>
              {link.label}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'Share Tech Mono', monospace", fontSize: 11,
          color: "var(--muted)",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: apiOnline ? "var(--green)" : "var(--red)",
            boxShadow: apiOnline ? "0 0 8px var(--green)" : "0 0 8px var(--red)",
          }} />
          {apiOnline ? "API CONNECTÉE" : "API HORS LIGNE"}
        </div>
        <div
          onClick={onLogout}
          style={{
            marginTop: 10, fontSize: 11, color: "var(--muted)",
            cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
          }}
        >⎋ Déconnexion</div>
      </div>
    </aside>
  );
}