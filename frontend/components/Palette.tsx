"use client";
import { Play, Sparkles, Filter, Globe, Shuffle, Webhook } from "lucide-react";
import type { Edge, Node } from "@xyflow/react";
import type { PipelineNodeData } from "@/lib/types";

const NODE_COLOR: Record<string, string> = {
  trigger:     "var(--color-node-trigger)",
  llm:         "var(--color-node-llm)",
  filter:      "var(--color-node-filter)",
  httpRequest: "var(--color-node-http)",
  transform:   "var(--color-node-transform)",
  webhook:     "var(--color-node-webhook)",
};

const NODE_TINT: Record<string, string> = {
  trigger:     "rgba(52,211,153,.14)",
  llm:         "rgba(167,139,250,.14)",
  filter:      "rgba(251,191,36,.14)",
  httpRequest: "rgba(96,165,250,.14)",
  transform:   "rgba(251,146,60,.14)",
  webhook:     "rgba(244,114,182,.14)",
};

const NODE_TYPES = [
  { type: "trigger",     label: "Trigger",        icon: <Play size={14} />,     description: "Start with a JSON payload" },
  { type: "llm",         label: "LLM Transform",  icon: <Sparkles size={14} />, description: "Groq AI completion" },
  { type: "filter",      label: "Filter",         icon: <Filter size={14} />,   description: "Boolean expression gate" },
  { type: "httpRequest", label: "HTTP Request",   icon: <Globe size={14} />,    description: "Outbound API call" },
  { type: "transform",   label: "Data Transform", icon: <Shuffle size={14} />,  description: "Reshape JSON with templates" },
  { type: "webhook",     label: "Webhook Output", icon: <Webhook size={14} />,  description: "POST result to a URL" },
];

interface Props {
  nodes?: Node<PipelineNodeData>[];
  edges?: Edge[];
}

export function Palette({ nodes = [], edges = [] }: Props) {
  const onDragStart = (e: React.DragEvent, type: string, label: string) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify({ type, label }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-[228px] flex-shrink-0 bg-card border-r border-border p-3 flex flex-col gap-1.5 overflow-y-auto">
      {/* Header */}
      <div className="px-1 pb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[.14em]" style={{ color: "var(--faint)" }}>
          Node Library
        </p>
        <p className="text-[10.5px] mt-[3px]" style={{ color: "var(--faint)", opacity: 0.75 }}>
          Drag onto the canvas
        </p>
      </div>

      {/* Node tiles */}
      {NODE_TYPES.map((n) => (
        <div
          key={n.type}
          draggable
          onDragStart={(e) => onDragStart(e, n.type, n.label)}
          className="flex items-start gap-2.5 px-2.5 py-[9px] rounded-[11px] border border-border bg-accent cursor-grab select-none hover:border-input transition-[border-color,transform] duration-150 hover:translate-x-0.5"
        >
          {/* Tint tile */}
          <span
            className="flex-shrink-0 w-[26px] h-[26px] rounded-lg grid place-items-center"
            style={{ background: NODE_TINT[n.type], color: NODE_COLOR[n.type] }}
          >
            {n.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold tracking-[-0.01em]">{n.label}</p>
            <p className="text-[10px] mt-[2px] leading-[1.35]" style={{ color: "var(--faint)" }}>
              {n.description}
            </p>
          </div>
        </div>
      ))}

      {/* Graph stats card */}
      <div className="mt-auto rounded-[11px] border border-dashed border-input bg-accent p-[11px]">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] m-0" style={{ color: "var(--faint)" }}>
          Graph
        </p>
        <div className="flex flex-col gap-[5px] mt-2 font-mono text-[10.5px] text-muted-foreground">
          <div className="flex justify-between">
            <span>nodes</span>
            <span className="text-foreground">{nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>edges</span>
            <span className="text-foreground">{edges.length}</span>
          </div>
          <div className="flex justify-between">
            <span>cycles</span>
            <span style={{ color: "var(--color-status-done)" }}>none</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
