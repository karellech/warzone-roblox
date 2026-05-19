import { useState } from "react";
import { createPlayer, createMatch } from "../services/api";

function notify(msg: string, type: "success" | "error") {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", right: "24px",
    background: type === "success" ? "rgba(0,230,118,0.1)" : "rgba(255,45,45,0.1)",
    border: `1px solid ${type === "success" ? "rgba(0,230,118,0.3)" : "rgba(255,45,45,0.3)"}`,
    color: type === "success" ? "var(--green)" : "var(--red)",
    borderRadius: "8px", padding: "14px 18px", fontSize: "13px",
    fontFamily: "'Share Tech Mono', monospace", zIndex: "999",
    transition: "all 0.3s",
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function Card({ title, badge, badgeColor, children }: {
  title: string; badge: string; badgeColor: string; children: React.ReactNode;
}) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    green:  { bg: "rgba(0,230,118,0.1)",   color: "var(--green)",  border: "rgba(0,230,118,0.2)" },
    blue:   { bg: "rgba(45,142,255,0.1)",   color: "var(--blue)",   border: "rgba(45,142,255,0.2)" },
    gold:   { bg: "rgba(255,184,0,0.1)",    color: "var(--gold)",   border: "rgba(255,184,0,0.2)" },
    red:    { bg: "rgba(255,45,45,0.15)",   color: "var(--red)",    border: "rgba(255,45,45,0.3)" },
  };
  const c = colors[badgeColor];
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{title}</span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "4px 10px", borderRadius: 3,
          background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{badge}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1, color: "var(--muted)", display: "block", marginBottom: 6 }}>{label}</label>
      <input {...props} style={{
        width: "100%", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 14,
        outline: "none", fontFamily: "'Exo 2',sans-serif",
      }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: { background: "var(--red)",                     color: "white",         border: "none" },
    ghost:   { background: "transparent",                    color: "var(--muted)",  border: "1px solid rgba(255,255,255,0.12)" },
    danger:  { background: "rgba(255,45,45,0.1)",            color: "var(--red)",    border: "1px solid rgba(255,45,45,0.3)" },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], padding: "9px 18px", borderRadius: 6,
      fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600,
      letterSpacing: 1, cursor: "pointer", transition: "all 0.2s",
    }}>{children}</button>
  );
}

export default function Admin() {
  const [userId, setUserId]     = useState("");
  const [username, setUsername] = useState("");
  const [matchPlayers, setMatchPlayers] = useState("10");
  const [createdId, setCreatedId]       = useState("");
  const [gradeUserId, setGradeUserId]   = useState("");
  const [gradeValue, setGradeValue]     = useState("Soldat");

  async function handleCreatePlayer() {
    if (!userId || !username) return notify("Remplissez tous les champs", "error");
    try {
      await createPlayer(parseInt(userId), username);
      notify(`Joueur ${username} créé !`, "success");
      setUserId(""); setUsername("");
    } catch { notify("Erreur lors de la création", "error"); }
  }

  async function handleCreateMatch() {
    try {
      const m = await createMatch(parseInt(matchPlayers));
      setCreatedId(m.id);
      notify("Partie créée !", "success");
    } catch { notify("Erreur lors de la création", "error"); }
  }

  function handleOverrideGrade() {
    if (!gradeUserId) return notify("Remplissez le Roblox ID", "error");
    notify(`Grade override → endpoint PUT /api/players/${gradeUserId} à implémenter`, "success");
  }

  function handleExport() {
    notify("Export déclenché depuis la page Classement", "success");
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        <Card title="Créer un Joueur" badge="TEST" badgeColor="green">
          <Input label="ROBLOX USER ID" type="number" placeholder="ex: 123456789" value={userId} onChange={e => setUserId(e.target.value)} />
          <Input label="USERNAME" placeholder="ex: Night_Cipher6" value={username} onChange={e => setUsername(e.target.value)} />
          <Btn onClick={handleCreatePlayer}>CRÉER LE JOUEUR</Btn>
        </Card>

        <Card title="Créer une Partie" badge="TEST" badgeColor="blue">
          <Input label="NOMBRE DE JOUEURS" type="number" value={matchPlayers} onChange={e => setMatchPlayers(e.target.value)} />
          <div style={{ marginBottom: 12 }}>
            <Btn onClick={handleCreateMatch}>CRÉER LA PARTIE</Btn>
          </div>
          {createdId && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
              ID : {createdId}
            </div>
          )}
        </Card>

        <Card title="Override Grade" badge="MODÉRATION" badgeColor="gold">
          <Input label="ROBLOX USER ID" type="number" placeholder="ex: 123456789" value={gradeUserId} onChange={e => setGradeUserId(e.target.value)} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1, color: "var(--muted)", display: "block", marginBottom: 6 }}>NOUVEAU GRADE</label>
            <select value={gradeValue} onChange={e => setGradeValue(e.target.value)} style={{
              width: "100%", background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6, padding: "9px 14px", color: "var(--text)", fontSize: 14, outline: "none",
            }}>
              {["Recrue", "Soldat", "Sergent", "Lieutenant", "Général"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <Btn onClick={handleOverrideGrade} variant="ghost">APPLIQUER</Btn>
        </Card>

        <Card title="Zone Dangereuse" badge="ATTENTION" badgeColor="red">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn onClick={handleRefresh} variant="danger">⟳ RAFRAÎCHIR TOUTES LES DONNÉES</Btn>
            <Btn onClick={handleExport}  variant="danger">↓ EXPORTER LEADERBOARD (JSON)</Btn>
          </div>
        </Card>

      </div>
    </div>
  );
}