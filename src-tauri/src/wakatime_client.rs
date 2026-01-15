use crate::http_client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct WakatimeResponse {
    data: WakatimeData,
}

#[derive(Debug, Serialize, Deserialize)]
struct WakatimeData {
    human_readable_total: String,
    total_seconds: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WakatimeStats {
    pub human_readable_total: String,
    pub total_seconds: f64,
}

pub async fn fetch_coding_hours(api_key: &str) -> Result<WakatimeStats, String> {
    let url = format!(
        "https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key={}",
        api_key
    );

    let response_body = http_client::fetch_url(&url).await?;

    let json: serde_json::Value =
        serde_json::from_str(&response_body).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    if let Some(error_msg) = json.get("error").and_then(|e| e.as_str()) {
        return Err(format!("WakaTime API Error: {}", error_msg));
    }

    // If no error, parse as success struct
    let res: WakatimeResponse = serde_json::from_value(json)
        .map_err(|e| format!("Invalid WakaTime response structure: {}", e))?;

    Ok(WakatimeStats {
        human_readable_total: res.data.human_readable_total,
        total_seconds: res.data.total_seconds,
    })
}
