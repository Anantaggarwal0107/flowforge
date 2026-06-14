"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Webhook } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function WebhookNode(props: NodeProps<Node<PipelineNodeData>>) {
  const url = props.data.config?.url ?? "";
  return (
    <BaseNode {...props} icon={<Webhook size={14} />}>
      <p className="text-[10px] text-white/40 truncate max-w-[160px]">
        {url ? url.slice(0, 30) + (url.length > 30 ? "…" : "") : "No URL set"}
      </p>
    </BaseNode>
  );
}
