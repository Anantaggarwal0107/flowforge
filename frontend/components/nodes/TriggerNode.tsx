"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Play } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function TriggerNode(props: NodeProps<Node<PipelineNodeData>>) {
  const hasPayload = Boolean(props.data.config?.payload);
  return (
    <BaseNode {...props} icon={<Play size={14} />}>
      <p className="text-[10px] text-white/40">
        {hasPayload ? "Payload set" : "No payload"}
      </p>
    </BaseNode>
  );
}
