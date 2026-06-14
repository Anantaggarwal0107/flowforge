"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Globe } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function HttpRequestNode(props: NodeProps<Node<PipelineNodeData>>) {
  const method = props.data.config?.method ?? "GET";
  const url = props.data.config?.url ?? "";
  return (
    <BaseNode {...props} icon={<Globe size={14} />}>
      <p className="text-[10px] text-white/40 font-mono truncate max-w-[160px]">
        {method} {url.slice(0, 30)}{url.length > 30 ? "…" : ""}
      </p>
    </BaseNode>
  );
}
