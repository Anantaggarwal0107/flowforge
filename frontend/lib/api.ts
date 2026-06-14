import type { Node, Edge } from "@xyflow/react";
import type { Pipeline, PipelineNodeData, SSEEvent } from "./types";

const BASE = "/api";

export async function listPipelines(): Promise<Pick<Pipeline, "id" | "name" | "created_at">[]> {
  const res = await fetch(`${BASE}/pipelines`);
  if (!res.ok) throw new Error("Failed to list pipelines");
  return res.json();
}

export async function getPipeline(id: number): Promise<Pipeline> {
  const res = await fetch(`${BASE}/pipelines/${id}`);
  if (!res.ok) throw new Error("Failed to get pipeline");
  return res.json();
}

export async function createPipeline(
  name: string,
  nodes: Node<PipelineNodeData>[],
  edges: Edge[]
): Promise<Pipeline> {
  const res = await fetch(`${BASE}/pipelines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, nodes, edges }),
  });
  if (!res.ok) throw new Error("Failed to create pipeline");
  return res.json();
}

export async function updatePipeline(
  id: number,
  name: string,
  nodes: Node<PipelineNodeData>[],
  edges: Edge[]
): Promise<Partial<Pipeline>> {
  const res = await fetch(`${BASE}/pipelines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, nodes, edges }),
  });
  if (!res.ok) throw new Error("Failed to update pipeline");
  return res.json();
}

export async function deletePipeline(id: number): Promise<void> {
  const res = await fetch(`${BASE}/pipelines/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete pipeline");
}

export async function* runPipeline(id: number): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${BASE}/pipelines/${id}/run`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start pipeline run");
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";
    for (const chunk of lines) {
      const line = chunk.trim();
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.slice(6)) as SSEEvent;
        } catch {
          // skip malformed
        }
      }
    }
  }
}
