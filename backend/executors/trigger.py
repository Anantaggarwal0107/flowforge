import json


async def execute(config: dict, input_data: dict) -> dict:
    try:
        return json.loads(config.get("payload", "{}"))
    except json.JSONDecodeError:
        raise ValueError("Trigger payload is not valid JSON")
