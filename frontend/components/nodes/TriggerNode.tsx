"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Play } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function TriggerNode(props: NodeProps<Node<PipelineNodeData>>) {
  const payload = props.data.config?.payload ?? "{}";
  const summary = payload.length > 2 ? "payload configured" : "POST /trigger";
  return (
    <BaseNode {...props} icon={<Play size={14} fill="currentColor" />}>
      {summary}
    </BaseNode>
  );
}
