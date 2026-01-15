import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface DashboardStats {
  life_score: number;
  github_commits: number;
  coding_hours: number;
  sleep_hours: number;
}

function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zenQuote, setZenQuote] = useState<string>("Connecting to the matrix...");

  useEffect(() => {
    // 1. Fetch Stats Mock
    invoke<DashboardStats>("get_dashboard_stats")
      .then(setStats)
      .catch(console.error);

    // 2. Fetch Real HTTP Data (GitHub Zen)
    invoke<string>("test_fetch")
      .then(setZenQuote)
      .catch((err) => setZenQuote(`Error: ${err}`));
  }, []);

  if (!stats) return <div className="container"><h1>Loading Life Stats...</h1></div>;

  return (
    <div className="container">
      {/* Custom Title Bar (Drag Region) */}
      <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-buttons">
          <div className="titlebar-button close"></div>
          <div className="titlebar-button minimize"></div>
          <div className="titlebar-button maximize"></div>
        </div>
      </div>

      <h1 className="header">Life Stats Manager</h1>

      {/* Score Circle Area */}
      <div className="score-card">
        <div className="score-circle">
          <span className="score-value">{stats.life_score}</span>
          <span className="score-label">SCORE</span>
        </div>
        <p className="quote">"{zenQuote}"</p>
      </div>

      {/* Grid of Stats */}
      <div className="stats-grid">
        <StatCard label="GitHub Commits" value={stats.github_commits} color="#4ade80" />
        <StatCard label="Coding Hours" value={stats.coding_hours + "h"} color="#60a5fa" />
        <StatCard label="Sleep Hours" value={stats.sleep_hours + "h"} color="#f472b6" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default App;
