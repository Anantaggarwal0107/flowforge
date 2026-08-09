"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function LLMNode(props: NodeProps<Node<PipelineNodeData>>) {
  return (
    <BaseNode {...props} icon={<Sparkles size={14} />}>
      llama-3.1-8b-instant
    </BaseNode>
  );
}
