import type { Node, Edge } from "@xyflow/react";

export type NodeType =
  | "trigger"
  | "llm"
  | "filter"
  | "httpRequest"
  | "transform"
  | "webhook";

export interface PipelineNodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
  config: Record<string, string>;
  execution?: NodeExecution;
}

export interface Pipeline {
  id: number;
  name: string;
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
  created_at: string;
}

export type ExecutionStatus = "idle" | "running" | "done" | "error";

export interface NodeExecution {
  nodeId: string;
  status: "pending" | "running" | "done" | "error";
  output?: Record<string, unknown>;
  error?: string;
  duration_ms?: number;
}

export type SSEEvent =
  | { type: "start"; total: number }
  | { type: "node_start"; node_id: string; node_type: string }
  | { type: "node_done"; node_id: string; output: Record<string, unknown>; duration_ms: number }
  | { type: "node_error"; node_id: string; error: string }
  | { type: "done" };
