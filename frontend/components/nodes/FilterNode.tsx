"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Filter } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function FilterNode(props: NodeProps<Node<PipelineNodeData>>) {
  const expr = props.data.config?.expression ?? "True";
  const summary = expr.length > 28 ? expr.slice(0, 28) + "…" : expr;
  return (
    <BaseNode {...props} icon={<Filter size={14} />}>
      {summary}
    </BaseNode>
  );
}
