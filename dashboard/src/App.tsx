// src/App.tsx
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Leaderboard  from "./pages/Leaderboard";
import MatchHistory from "./pages/MatchHistory";

function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? "bg-red-600 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-700"
    }`;

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center gap-6">
      <span className="text-white font-black text-xl tracking-wider mr-4">
        ⚔ WARZONE
      </span>
      <NavLink to="/"        className={linkClass}>Classement</NavLink>
      <NavLink to="/matches" className={linkClass}>Parties</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="py-4">
          <Routes>
            <Route path="/"        element={<Leaderboard />} />
            <Route path="/matches" element={<MatchHistory />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}