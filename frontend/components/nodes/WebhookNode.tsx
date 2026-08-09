"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Webhook } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function WebhookNode(props: NodeProps<Node<PipelineNodeData>>) {
  const url = props.data.config?.url ?? "";
  const summary = url
    ? url.replace(/^https?:\/\//, "").split("?")[0].slice(0, 28) + (url.length > 28 ? "…" : "")
    : "no url set";
  return (
    <BaseNode {...props} icon={<Webhook size={14} />}>
      {summary}
    </BaseNode>
  );
}
