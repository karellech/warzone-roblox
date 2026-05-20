import { useState } from "react";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  function handleLogin() {
    if (user === "admin" && pass === "admin") {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      position: "relative", zIndex: 10,
    }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16, padding: "48px 40px", width: 380, textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 700,
          letterSpacing: 6, background: "linear-gradient(135deg, var(--red), #FF8C00)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>⚔ WARZONE</div>

        <div style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
          letterSpacing: 3, color: "var(--muted)", marginBottom: 36,
        }}>ADMIN DASHBOARD // ACCÈS RESTREINT</div>

        {error && (
          <div style={{
            background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)",
            borderRadius: 6, padding: "10px", fontSize: 13, color: "var(--red)",
            marginBottom: 16,
          }}>Identifiants incorrects</div>
        )}

        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
            letterSpacing: 1, color: "var(--muted)", display: "block", marginBottom: 6,
          }}>IDENTIFIANT</label>
          <input
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="admin"
            style={{
              width: "100%", background: "var(--bg3)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
              padding: "9px 14px", color: "var(--text)", fontSize: 14, outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
            letterSpacing: 1, color: "var(--muted)", display: "block", marginBottom: 6,
          }}>MOT DE PASSE</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{
              width: "100%", background: "var(--bg3)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
              padding: "9px 14px", color: "var(--text)", fontSize: 14, outline: "none",
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: 12, background: "var(--red)", color: "white",
            border: "none", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Rajdhani', sans-serif", fontSize: 16,
            fontWeight: 700, letterSpacing: 2,
          }}
        >CONNEXION</button>

        <div style={{
          marginTop: 16, fontSize: 11, color: "var(--muted)",
          fontFamily: "'Share Tech Mono', monospace",
        }}>demo : admin / admin</div>
      </div>
    </div>
  );
}