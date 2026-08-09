"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Globe } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function HttpRequestNode(props: NodeProps<Node<PipelineNodeData>>) {
  const method = props.data.config?.method ?? "GET";
  const url = props.data.config?.url ?? "";
  const host = url ? url.replace(/^https?:\/\//, "").split("/")[0] : "no url";
  const summary = `${method} ${host}`;
  return (
    <BaseNode {...props} icon={<Globe size={14} />}>
      {summary.length > 28 ? summary.slice(0, 28) + "…" : summary}
    </BaseNode>
  );
}
