use reqwest::header::USER_AGENT;

pub async fn fetch_url(url: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(url)
        // GitHub requires a User-Agent header
        .header(USER_AGENT, "LifeStats-Dashboard")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = res.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}
