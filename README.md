# Life Stats Dashboard ⚡️

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

> **"You're in the top 5% of devs today."**

A high-performance, privacy-first desktop dashboard that aggregates your digital life. Built with **Rust** for logic and **React** for a futuristic, cyberpunk UI.

![Dashboard Preview](https://via.placeholder.com/800x450.png?text=Dashboard+Preview) 
*(Screenshot coming soon)*

## 🚀 Concept

**Life Stats** is your personal "Head-Up Display" for productivity and health. It connects to your data sources to provide real-time correlation and insights without sending your data to a third-party server.

- **GitHub**: Track commit streaks, PRs, and "Wave" activity graphs.
- **WakaTime**: Visualize deep work hours and language breakdown.
- **Health**: Correlate sleep patterns with coding efficiency.
- **Smart Scores**: An aggregated "Life Score" (0-100) based on your daily metrics.

## 🛠 Tech Stack

- **Core**: [Rust](https://www.rust-lang.org/) (Data Processing, HTTP Clients, System Tray)
- **App Framework**: [Tauri v2](https://tauri.app/) (Security, Native Shell)
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Modules (Dark Mode / Glassmorphism)
- **State**: TanStack Query / Zustand

## ⚡️ Getting Started

### Prerequisites

- **Rust**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Node.js**: v18+

### Running Locally

```bash
# Install frontend dependencies
npm install

# Run the desktop app in dev mode
npm run tauri dev
```

## 🗺 Roadmap

- [x] **Day 1**: Project Genesis (Tauri v2 Scaffold)
- [x] **Day 2**: Rust-Frontend Bridge & Data Flow
- [x] **Day 3**: Custom Transparent Window Shell
- [ ] **Day 4**: Async Rust HTTP Client (`reqwest`)
- [ ] **Day 5**: GitHub API Integration
- [ ] **Day 6**: Activity Wave Visualization
- [ ] ... and more.

## 📄 License

MIT © Shubham Badola
