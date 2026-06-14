import httpx


async def execute(config: dict, input_data: dict) -> dict:
    url = config.get("url", "")
    if not url:
        raise ValueError("Webhook URL is required")
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=input_data)
    return {"delivered": True, "status_code": resp.status_code, "url": url}
