import os
import re
from groq import AsyncGroq


def _render(template: str, data: dict) -> str:
    def replacer(m):
        key = m.group(1).strip()
        return str(data.get(key, m.group(0)))
    return re.sub(r"\{\{(.+?)\}\}", replacer, template)


async def execute(config: dict, input_data: dict) -> dict:
    client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    system = config.get("system_prompt", "You are a helpful assistant.")
    user_template = config.get("user_prompt", "{{input}}")
    if "{{" not in user_template:
        import json
        user_msg = user_template + "\n\nInput: " + json.dumps(input_data)
    else:
        user_msg = _render(user_template, {**input_data, "input": str(input_data)})
    response = await client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ],
        max_tokens=512,
    )
    return {"response": response.choices[0].message.content, **input_data}
