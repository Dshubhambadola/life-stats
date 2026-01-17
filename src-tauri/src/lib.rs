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

#[derive(Serialize, Deserialize)]
pub struct FullDashboardStats {
    life_score: u8,
    github_user: Option<github::GithubUser>,
    wakatime_stats: Option<wakatime_client::WakatimeStats>,
    zen_quote: String,
}

#[tauri::command]
async fn get_full_dashboard_stats(
    github_username: String,
    wakatime_key: Option<String>,
) -> Result<FullDashboardStats, String> {
    // 1. Define Futures
    let github_future = github::fetch_user(&github_username);
    let zen_future = http_client::fetch_url("https://api.github.com/zen");

    // Handle optional WakaTime future
    let waka_future = async {
        if let Some(key) = wakatime_key {
            wakatime_client::fetch_coding_hours(&key).await.ok()
        } else {
            None::<wakatime_client::WakatimeStats>
        }
    };

    // 2. Run in Parallel
    let (github_res, zen_res, waka_res) = tokio::join!(github_future, zen_future, waka_future);

    // 3. Construct Response
    Ok(FullDashboardStats {
        life_score: 88, // Still mock for now
        github_user: github_res.ok(),
        wakatime_stats: waka_res,
        zen_quote: zen_res.unwrap_or_else(|_| "Connecting to the matrix...".to_string()),
    })
}

// Keep individual commands for debugging/testing if needed
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

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => {
                        println!("Quit requested");
                        app.exit(0);
                    }
                    "show" => {
                        println!("Show requested for 'main' window");
                        if let Some(window) = app.get_webview_window("main") {
                            // Force state reset
                            let _ = window.hide();
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();

                            // Z-Order Hack: Jump to front
                            let _ = window.set_always_on_top(true);
                            let _ = window.set_always_on_top(false);
                        } else {
                            println!("CRITICAL: Window 'main' not found");
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_dashboard_stats,
            test_fetch,
            get_github_user,
            get_wakatime_stats,
            get_full_dashboard_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
