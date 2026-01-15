use crate::http_client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GithubUser {
    pub login: String,
    pub name: Option<String>,
    pub avatar_url: String,
    pub public_repos: u32,
    pub followers: u32,
    pub following: u32,
}

pub async fn fetch_user(username: &str) -> Result<GithubUser, String> {
    let url = format!("https://api.github.com/users/{}", username);
    let response_body = http_client::fetch_url(&url).await?;

    let user: GithubUser = serde_json::from_str(&response_body)
        .map_err(|e| format!("Failed to parse GitHub JSON: {}", e))?;

    Ok(user)
}
