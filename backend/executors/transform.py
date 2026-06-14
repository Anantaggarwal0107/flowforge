import re
import json


def _render_value(v, data):
    if isinstance(v, str):
        def replacer(m):
            key = m.group(1).strip()
            parts = key.split(".")
            val = data
            for p in parts:
                if isinstance(val, dict):
                    val = val.get(p, m.group(0))
                else:
                    return m.group(0)
            return str(val)
        return re.sub(r"\{\{(.+?)\}\}", replacer, v)
    if isinstance(v, dict):
        return {k: _render_value(vv, data) for k, vv in v.items()}
    if isinstance(v, list):
        return [_render_value(item, data) for item in v]
    return v


async def execute(config: dict, input_data: dict) -> dict:
    template_str = config.get("template", "{}")
    try:
        template = json.loads(template_str)
    except json.JSONDecodeError:
        raise ValueError("Transform template is not valid JSON")
    return _render_value(template, input_data)
