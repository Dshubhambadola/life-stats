mod http_client;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_dashboard_stats, test_fetch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
