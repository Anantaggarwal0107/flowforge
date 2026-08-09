"use client";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
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

interface BaseNodeProps extends NodeProps<Node<PipelineNodeData>> {
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export function BaseNode({ data, selected, icon, children }: BaseNodeProps) {
  const status = data.execution?.status ?? "pending";
  const nodeType = data.nodeType;

  /* ── border + shadow per status ── */
  let borderColor = "var(--border)";
  let boxShadow = "var(--shadow-panel)";
  let dotColor = "var(--input)";
  let dotPulse = false;

  if (selected) {
    borderColor = "var(--primary)";
    boxShadow = "0 0 0 3px var(--accent-soft), var(--shadow-panel)";
  } else if (status === "running") {
    borderColor = "#fbbf24";
    boxShadow = "0 0 0 3px rgba(251,191,36,.14), var(--shadow-panel)";
    dotColor = "#fbbf24";
    dotPulse = true;
  } else if (status === "done") {
    borderColor = "rgba(52,211,153,.5)";
    dotColor = "var(--color-status-done)";
  } else if (status === "error") {
    borderColor = "#f87171";
    boxShadow = "0 0 0 3px rgba(248,113,113,.16), var(--shadow-panel)";
    dotColor = "#f87171";
  }

  const color = NODE_COLOR[nodeType] ?? "var(--muted-foreground)";
  const tint  = NODE_TINT[nodeType]  ?? "rgba(255,255,255,.08)";

  return (
    <div
      className="w-[212px] rounded-[14px] bg-card transition-[box-shadow,border-color] duration-200"
      style={{ border: `1px solid ${borderColor}`, boxShadow }}
    >
      <Handle type="target" position={Position.Left} />

      {/* Row 1 */}
      <div className="flex items-center gap-[9px] px-3 pt-2.5 pb-2">
        <span
          className="w-6 h-6 flex-shrink-0 rounded-[7px] grid place-items-center"
          style={{ background: tint, color }}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold tracking-[-0.01em] truncate">{data.label}</p>
          <p className="font-mono text-[9px] tracking-[.03em]" style={{ color: "var(--faint)" }}>
            {nodeType}
          </p>
        </div>
        {/* Status dot — only the dot pulses, not the whole node */}
        <span
          className="w-[7px] h-[7px] rounded-full flex-shrink-0"
          style={{
            backgroundColor: dotColor,
            animation: dotPulse ? "ffin 0.9s ease-in-out infinite alternate" : "none",
          }}
        />
      </div>

      {/* Row 2 */}
      <div className="border-t border-border px-3 py-[7px] flex items-center justify-between gap-2 min-w-0">
        <div className="font-mono text-[9.5px] text-muted-foreground truncate flex-1 min-w-0">
          {children}
        </div>
        {data.execution?.duration_ms !== undefined && (
          <span
            className="font-mono text-[9.5px] font-medium flex-shrink-0"
            style={{ color: dotColor }}
          >
            {data.execution.duration_ms}ms
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
