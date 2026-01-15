import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import "./App.css";

// Mock Data for the Wave
const ACTIVITY_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  calories: Math.floor(Math.random() * (2500 - 1800) + 1800),
  commits: Math.floor(Math.random() * 15),
  focus: Math.floor(Math.random() * (100 - 60) + 60),
}));

// Donut Chart Colors
const COLORS = ['#10b981', '#60a5fa', '#f472b6', '#f59e0b', '#8b5cf6'];

function TechDonut({ data }: { data: { name: string, percent: number }[] }) {
  // Filter out tiny values for cleaner chart
  const cleanData = data.filter(d => d.percent > 1).slice(0, 5);

  if (cleanData.length === 0) return <div className="no-data">No Language Data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={cleanData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          paddingAngle={5}
          dataKey="percent"
          stroke="none"
        >
          {cleanData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1b1e', border: 'none', borderRadius: '8px' }}
          itemStyle={{ color: '#e5e7eb' }}
          formatter={(value: number | undefined) => `${(value || 0).toFixed(1)}%`}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconSize={8}
          wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

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

interface WakatimeStats {
  human_readable_total: string;
  total_seconds: number;
  languages: { name: string; percent: number; text: string }[];
}

interface FullDashboardStats {
  life_score: number;
  github_user: GithubUser | null;
  wakatime_stats: WakatimeStats | null;
  zen_quote: string;
}

function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null); // Keep for legacy/mock
  const [fullStats, setFullStats] = useState<FullDashboardStats | null>(null);

  // Local state for UI only
  const [apiKey, setApiKey] = useState("");
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    // Initial Data Load
    loadData();
  }, []);

  async function loadData() {
    try {
      const store = await load("life-stats-store.json");
      const storedKey = await store.get<string>("wakatime_api_key");

      // Fetch Everything in Parallel (Rust side)
      const data = await invoke<FullDashboardStats>("get_full_dashboard_stats", {
        githubUsername: "Dshubhambadola",
        wakatimeKey: storedKey || null,
      });

      setFullStats(data);

      // Update legacy mock stats (optional, or just use fullStats)
      setStats({
        life_score: data.life_score,
        github_commits: data.github_user?.public_repos || 0, // Mock mapping
        coding_hours: 0,
        sleep_hours: 7.3,
      });

      if (!storedKey && !data.wakatime_stats) {
        setNeedsApiKey(true);
      } else {
        setNeedsApiKey(false);
      }

    } catch (e) {
      console.error("Failed to load dashboard:", e);
    }
  }

  async function handleSaveKey() {
    if (!apiKey) return;
    try {
      const store = await load("life-stats-store.json");
      await store.set("wakatime_api_key", apiKey);
      await store.save(); // Persist to disk
      loadData(); // Reload all data
    } catch (e) {
      console.error("Failed to save key:", e);
    }
  }

  const handleMinimize = () => {
    console.log("Minimize clicked");
    getCurrentWindow().minimize();
  };
  const handleMaximize = () => {
    console.log("Maximize clicked");
    getCurrentWindow().toggleMaximize();
  };
  const handleClose = () => {
    console.log("Close clicked");
    getCurrentWindow().close();
  };

  if (!fullStats) return <div className="container"><h1>Loading Life Stats...</h1></div>;

  const user = fullStats.github_user;
  const wakaStats = fullStats.wakatime_stats;

  return (
    <div className="container">
      {/* Custom Title Bar */}
      <div className="titlebar">
        <div className="titlebar-buttons">
          <div onClick={handleClose} className="titlebar-button close"></div>
          <div onClick={handleMinimize} className="titlebar-button minimize"></div>
          <div onClick={handleMaximize} className="titlebar-button maximize"></div>
        </div>
        <div data-tauri-drag-region className="titlebar-drag-region"></div>
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
          <span className="score-value">{fullStats.life_score}</span>
          <span className="score-label">SCORE</span>
        </div>
        <p className="quote">"{fullStats.zen_quote}"</p>
      </div>

      {/* Grid of Stats */}
      <div className="stats-grid">
        <StatCard label="GitHub Commits" value={stats?.github_commits || 0} color="#4ade80" />

        {/* WakaTime Card */}
        {needsApiKey ? (
          <div className="stat-card" style={{ borderTop: `4px solid #60a5fa` }}>
            <div className="api-input-container">
              <input
                type="password"
                placeholder="WakaTime Key"
                className="api-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button className="api-save-btn" onClick={handleSaveKey}>Save</button>
            </div>
            <div className="stat-label">Connect WakaTime</div>
          </div>
        ) : (
          <StatCard
            label="7-Day Coding"
            value={wakaStats ? wakaStats.human_readable_total : "Loading..."}
            color="#60a5fa"
          />
        )}

        <StatCard label="Sleep Hours" value={stats?.sleep_hours + "h"} color="#f472b6" />

        {/* Tech Stack Donut */}
        <div className="stat-card" style={{ borderTop: `4px solid #f59e0b`, minHeight: '160px' }}>
          <div style={{ height: '120px', width: '100%', marginTop: '10px' }}>
            {wakaStats ? (
              <TechDonut data={wakaStats.languages} />
            ) : (
              <div className="no-data">Connect WakaTime</div>
            )}
          </div>
          <div className="stat-label" style={{ marginTop: '0' }}>Top Languages</div>
        </div>
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
