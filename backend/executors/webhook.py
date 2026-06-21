import httpx


async def execute(config: dict, input_data: dict) -> dict:
    url = config.get("url", "").strip()
    if not url:
        # No URL configured — pass data through without delivering
        return {"delivered": False, "skipped": True, "reason": "No webhook URL configured", **input_data}
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=input_data)
    return {"delivered": True, "status_code": resp.status_code, "url": url}
