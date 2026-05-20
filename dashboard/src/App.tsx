import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar   from "./components/Sidebar";
import Topbar    from "./components/Topbar";
import Login     from "./pages/Login";
import Overview  from "./pages/Overview";
import Leaderboard from "./pages/Leaderboard";
import Matches   from "./pages/Matches";
import Analytics from "./pages/Analytics";
import Players   from "./pages/Players";
import Admin     from "./pages/Admin";

const PAGE_TITLES: Record<string, string> = {
  "/":            "TABLEAU DE BORD",
  "/leaderboard": "CLASSEMENT GLOBAL",
  "/matches":     "HISTORIQUE DES PARTIES",
  "/analytics":   "ANALYTICS",
  "/players":     "GESTION JOUEURS",
  "/admin":       "PANEL ADMIN",
};

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const path = window.location.pathname;
  const title = PAGE_TITLES[path] ?? "WARZONE";

  return (
    <div>
      <Sidebar onLogout={onLogout} apiOnline={true} />
      <div style={{ marginLeft: 240, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <Topbar title={title} apiOnline={true} />
        <Routes>
          <Route path="/"            element={<Overview />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/matches"     element={<Matches />} />
          <Route path="/analytics"   element={<Analytics />} />
          <Route path="/players"     element={<Players />} />
          <Route path="/admin"       element={<Admin />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [logged, setLogged] = useState(false);

  return (
    <BrowserRouter>
      {logged
        ? <Dashboard onLogout={() => setLogged(false)} />
        : <Login onLogin={() => setLogged(true)} />
      }
    </BrowserRouter>
  );
}