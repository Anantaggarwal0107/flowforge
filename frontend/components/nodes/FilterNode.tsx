"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Filter } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function FilterNode(props: NodeProps<Node<PipelineNodeData>>) {
  const expr = props.data.config?.expression ?? "True";
  return (
    <BaseNode {...props} icon={<Filter size={14} />}>
      <p className="text-[10px] text-white/40 font-mono truncate max-w-[160px]">{expr}</p>
    </BaseNode>
  );
}
