import ast

_SAFE_BUILTINS = {
    "len": len, "str": str, "int": int, "float": float,
    "bool": bool, "list": list, "dict": dict, "isinstance": isinstance,
    "True": True, "False": False, "None": None,
}


async def execute(config: dict, input_data: dict) -> dict:
    expression = config.get("expression", "True")
    try:
        ast.parse(expression, mode="eval")
    except SyntaxError as e:
        raise ValueError(f"Invalid expression: {e}")
    namespace = {"__builtins__": _SAFE_BUILTINS, "data": input_data, **input_data}
    result = eval(expression, namespace)  # noqa: S307
    if not result:
        raise ValueError(
            f"Filter blocked: expression '{expression}' was falsy for the given data"
        )
    return input_data
