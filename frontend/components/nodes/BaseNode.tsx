"use client";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { PipelineNodeData } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-white/20 bg-white/5",
  running: "border-yellow-400 bg-yellow-400/10 animate-pulse",
  done: "border-emerald-400 bg-emerald-400/10",
  error: "border-red-400 bg-red-400/10",
};

interface BaseNodeProps extends NodeProps<Node<PipelineNodeData>> {
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export function BaseNode({ data, selected, icon, children }: BaseNodeProps) {
  const status = data.execution?.status ?? "pending";
  return (
    <div
      className={`min-w-[180px] rounded-xl border-2 p-3 transition-colors ${STATUS_COLORS[status]} ${
        selected ? "ring-2 ring-indigo-400" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/40" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white/60">{icon}</span>
        <span className="text-xs font-semibold text-white/80">{data.label}</span>
      </div>
      {children}
      <Handle type="source" position={Position.Right} className="!bg-white/40" />
    </div>
  );
}
