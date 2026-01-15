import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface DashboardStats {
  life_score: number;
  github_commits: number;
  coding_hours: number;
  sleep_hours: number;
}

interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
}

function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zenQuote, setZenQuote] = useState<string>("Connecting to the matrix...");
  const [user, setUser] = useState<GithubUser | null>(null);

  useEffect(() => {
    // 1. Fetch Stats Mock
    invoke<DashboardStats>("get_dashboard_stats")
      .then(setStats)
      .catch(console.error);

    // 2. Fetch Real HTTP Data (GitHub Zen)
    invoke<string>("test_fetch")
      .then(setZenQuote)
      .catch((err) => setZenQuote(`Error: ${err}`));

    // 3. Fetch GitHub Profile
    invoke<GithubUser>("get_github_user", { username: "shubhambadola" })
      .then(setUser)
      .catch(console.error);
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

      <div className="header-section">
        {user && (
          <div className="profile">
            <img src={user.avatar_url} alt="Profile" className="profile-img" />
            <div className="profile-info">
              <div className="profile-name">{user.name || user.login}</div>
              <div className="profile-stats">{user.public_repos} Repos</div>
            </div>
          </div>
        )}
        <h1 className="header-title">Life Stats</h1>
      </div>

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
