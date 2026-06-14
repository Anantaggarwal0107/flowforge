"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Shuffle } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function DataTransformNode(props: NodeProps<Node<PipelineNodeData>>) {
  const hasTemplate = Boolean(props.data.config?.template);
  return (
    <BaseNode {...props} icon={<Shuffle size={14} />}>
      <p className="text-[10px] text-white/40">
        {hasTemplate ? "Template configured" : "No template"}
      </p>
    </BaseNode>
  );
}
