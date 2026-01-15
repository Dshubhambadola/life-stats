mod github;
mod http_client;
mod wakatime_client;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DashboardStats {
    life_score: u8,
    github_commits: u32,
    coding_hours: f32,
    sleep_hours: f32,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn get_dashboard_stats() -> DashboardStats {
    // Mock data for Day 2 verification
    DashboardStats {
        life_score: 88,
        github_commits: 42,
        coding_hours: 6.4,
        sleep_hours: 7.3,
    }
}

#[tauri::command]
async fn test_fetch() -> Result<String, String> {
    // Fetch a random Zen quote from GitHub to test connectivity
    http_client::fetch_url("https://api.github.com/zen").await
}

#[tauri::command]
async fn get_github_user(username: &str) -> Result<github::GithubUser, String> {
    github::fetch_user(username).await
}

#[tauri::command]
async fn get_wakatime_stats(api_key: &str) -> Result<wakatime_client::WakatimeStats, String> {
    wakatime_client::fetch_coding_hours(api_key).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_dashboard_stats,
            test_fetch,
            get_github_user,
            get_wakatime_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
