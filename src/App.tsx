import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import "./App.css";

// Mock Data for the Wave
const ACTIVITY_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  calories: Math.floor(Math.random() * (2500 - 1800) + 1800),
  commits: Math.floor(Math.random() * 15),
  focus: Math.floor(Math.random() * (100 - 60) + 60),
}));

function ActivityWave() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={ACTIVITY_DATA}>
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1b1e', border: 'none', borderRadius: '8px' }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <XAxis dataKey="day" hide />
        <Line
          type="monotone"
          dataKey="commits"
          stroke="#10b981"
          strokeWidth={3}
          dot={false}
          strokeOpacity={0.8}
        />
        <Line
          type="monotone"
          dataKey="focus"
          stroke="#60a5fa"
          strokeWidth={3}
          dot={false}
          strokeOpacity={0.5}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

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
    invoke<GithubUser>("get_github_user", { username: "Dshubhambadola" })
      .then(setUser)
      .catch(console.error);
  }, []);

  const handleMinimize = () => getCurrentWindow().minimize();
  const handleMaximize = () => getCurrentWindow().toggleMaximize();
  const handleClose = () => getCurrentWindow().close();

  if (!stats) return <div className="container"><h1>Loading Life Stats...</h1></div>;

  return (
    <div className="container">
      {/* Custom Title Bar (Drag Region) */}
      <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-buttons">
          <div onClick={handleClose} className="titlebar-button close"></div>
          <div onClick={handleMinimize} className="titlebar-button minimize"></div>
          <div onClick={handleMaximize} className="titlebar-button maximize"></div>
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

      {/* Activity Chart Area */}
      <div className="chart-container">
        <h3 className="chart-title">Activity Wave</h3>
        <div className="chart-wrapper">
          <ActivityWave />
        </div>
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
