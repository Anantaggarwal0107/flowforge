import httpx
import json
import re


def _render(template: str, data: dict) -> str:
    def replacer(m):
        key = m.group(1).strip()
        return str(data.get(key, m.group(0)))
    return re.sub(r"\{\{(.+?)\}\}", replacer, template)


async def execute(config: dict, input_data: dict) -> dict:
    method = config.get("method", "GET").upper()
    url = _render(config.get("url", ""), input_data)
    headers = json.loads(config.get("headers", "{}"))
    body_template = config.get("body", "")
    body = json.loads(_render(body_template, input_data)) if body_template else None
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.request(method, url, headers=headers, json=body)
    try:
        return resp.json()
    except Exception:
        return {"status_code": resp.status_code, "text": resp.text[:2000]}
