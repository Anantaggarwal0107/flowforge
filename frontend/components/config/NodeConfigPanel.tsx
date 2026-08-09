"use client";
import type { Node } from "@xyflow/react";
import type { PipelineNodeData, NodeExecution } from "@/lib/types";
import { TriggerConfig } from "./TriggerConfig";
import { LLMConfig } from "./LLMConfig";
import { FilterConfig } from "./FilterConfig";
import { HttpRequestConfig } from "./HttpRequestConfig";
import { DataTransformConfig } from "./DataTransformConfig";
import { WebhookConfig } from "./WebhookConfig";

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

const NODE_ICON: Record<string, string> = {
  trigger:     "▶",
  llm:         "✦",
  filter:      "◈",
  httpRequest: "⊕",
  transform:   "⇄",
  webhook:     "⌁",
};

interface Props {
  node: Node<PipelineNodeData> | null;
  onUpdateConfig: (nodeId: string, config: Record<string, string>) => void;
  executions?: Map<string, NodeExecution>;
}

const CONFIG_MAP = {
  trigger:     TriggerConfig,
  llm:         LLMConfig,
  filter:      FilterConfig,
  httpRequest: HttpRequestConfig,
  transform:   DataTransformConfig,
  webhook:     WebhookConfig,
} as const;

export function NodeConfigPanel({ node, onUpdateConfig, executions }: Props) {
  if (!node) {
    return (
      <aside className="w-[296px] flex-shrink-0 bg-card border-l border-border flex items-center justify-center">
        <p className="text-xs text-center px-4" style={{ color: "var(--faint)" }}>
          Click a node to configure it
        </p>
      </aside>
    );
  }

  const nodeType = node.data.nodeType;
  const ConfigComponent = CONFIG_MAP[nodeType];
  const color = NODE_COLOR[nodeType] ?? "var(--muted-foreground)";
  const tint  = NODE_TINT[nodeType]  ?? "rgba(255,255,255,.08)";
  const execution = executions?.get(node.id) ?? node.data.execution;

  return (
    <aside className="w-[296px] flex-shrink-0 bg-card border-l border-border flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[.14em] mb-2" style={{ color: "var(--faint)" }}>
          Configure
        </p>
        <div className="flex items-center gap-[9px]">
          <span
            className="w-[26px] h-[26px] flex-shrink-0 rounded-[8px] grid place-items-center text-[12px]"
            style={{ background: tint, color }}
          >
            {NODE_ICON[nodeType] ?? "◯"}
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">{node.data.label}</p>
            <p className="font-mono text-[9.5px] mt-[1px]" style={{ color: "var(--faint)" }}>
              {node.id}
            </p>
          </div>
        </div>
      </div>

      {/* Config fields */}
      <div className="p-4 flex-1 flex flex-col gap-3.5">
        {ConfigComponent ? (
          <ConfigComponent
            config={node.data.config}
            onChange={(config) => onUpdateConfig(node.id, config)}
          />
        ) : (
          <p className="text-xs" style={{ color: "var(--faint)" }}>No configuration for this node type.</p>
        )}
      </div>

      {/* Last output card */}
      {execution && (
        <div className="mx-4 mb-4 rounded-[11px] border border-border bg-accent p-[13px] flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[.12em] mb-2" style={{ color: "var(--faint)" }}>
            Last output
          </p>
          <pre
            className="font-mono text-[10px] leading-[1.65] text-muted-foreground whitespace-pre-wrap break-words m-0"
          >
            {execution.error
              ? execution.error
              : execution.output !== undefined
                ? JSON.stringify(execution.output, null, 2)
                : "—"}
          </pre>
        </div>
      )}
    </aside>
  );
}
