interface Props {
  title: string;
  apiOnline: boolean;
}

export default function Topbar({ title, apiOnline }: Props) {
  return (
    <div style={{
      padding: "20px 32px", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(8,11,16,0.8)", backdropFilter: "blur(10px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase",
      }}>{title}</div>
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
          padding: "4px 10px", borderRadius: 3, letterSpacing: 1,
          background: apiOnline ? "rgba(0,230,118,0.1)" : "rgba(255,45,45,0.1)",
          color: apiOnline ? "var(--green)" : "var(--red)",
          border: `1px solid ${apiOnline ? "rgba(0,230,118,0.2)" : "rgba(255,45,45,0.2)"}`,
        }}>
          {apiOnline ? "● API EN LIGNE" : "● API HORS LIGNE"}
        </span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
          padding: "4px 10px", borderRadius: 3, letterSpacing: 1,
          background: "rgba(255,45,45,0.15)", color: "var(--red)",
          border: "1px solid rgba(255,45,45,0.3)",
        }}>ADMIN</span>
      </div>
    </div>
  );
}