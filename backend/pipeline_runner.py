import json
import time
from collections import defaultdict, deque
from typing import AsyncGenerator

from executors import EXECUTORS


def topological_sort(nodes: list, edges: list) -> list:
    node_ids = [n["id"] for n in nodes]
    adj = defaultdict(list)
    in_degree = {nid: 0 for nid in node_ids}

    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        adj[src].append(tgt)
        in_degree[tgt] = in_degree.get(tgt, 0) + 1

    queue = deque(nid for nid in node_ids if in_degree[nid] == 0)
    sorted_ids = []

    while queue:
        nid = queue.popleft()
        sorted_ids.append(nid)
        for tgt in adj[nid]:
            in_degree[tgt] -= 1
            if in_degree[tgt] == 0:
                queue.append(tgt)

    if len(sorted_ids) != len(node_ids):
        raise ValueError("Pipeline contains a cycle — execution aborted")

    node_map = {n["id"]: n for n in nodes}
    return [node_map[nid] for nid in sorted_ids]


async def run_pipeline(nodes: list, edges: list) -> AsyncGenerator[dict, None]:
    sorted_nodes = topological_sort(nodes, edges)
    outputs: dict[str, dict] = {}

    predecessors: dict[str, list[str]] = defaultdict(list)
    for edge in edges:
        predecessors[edge["target"]].append(edge["source"])

    yield {"type": "start", "total": len(sorted_nodes)}

    for node in sorted_nodes:
        node_id = node["id"]
        node_type = node.get("type") or node.get("data", {}).get("nodeType", "trigger")
        config = node.get("data", {}).get("config", {})

        input_data: dict = {}
        for pred_id in predecessors[node_id]:
            if pred_id in outputs:
                input_data = outputs[pred_id]

        yield {"type": "node_start", "node_id": node_id, "node_type": node_type}

        executor = EXECUTORS.get(node_type)
        if executor is None:
            yield {"type": "node_error", "node_id": node_id, "error": f"No executor for type '{node_type}'"}
            return

        t0 = time.monotonic()
        try:
            result = await executor(config, input_data)
            duration_ms = round((time.monotonic() - t0) * 1000)
            outputs[node_id] = result
            yield {"type": "node_done", "node_id": node_id, "output": result, "duration_ms": duration_ms}
        except Exception as e:
            yield {"type": "node_error", "node_id": node_id, "error": str(e)}
            return

    yield {"type": "done"}
