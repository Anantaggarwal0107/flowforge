"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function LLMNode(props: NodeProps<Node<PipelineNodeData>>) {
  const system = props.data.config?.system_prompt ?? "";
  return (
    <BaseNode {...props} icon={<Sparkles size={14} />}>
      <p className="text-[10px] text-white/40">llama-3.1-8b-instant</p>
      {system && (
        <p className="text-[10px] text-white/30 truncate max-w-[160px]">
          {system.slice(0, 30)}{system.length > 30 ? "…" : ""}
        </p>
      )}
    </BaseNode>
  );
}
