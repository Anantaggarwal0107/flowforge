"use client";
import type { Node } from "@xyflow/react";
import type { PipelineNodeData } from "@/lib/types";
import { TriggerConfig } from "./TriggerConfig";
import { LLMConfig } from "./LLMConfig";
import { FilterConfig } from "./FilterConfig";
import { HttpRequestConfig } from "./HttpRequestConfig";
import { DataTransformConfig } from "./DataTransformConfig";
import { WebhookConfig } from "./WebhookConfig";

interface Props {
  node: Node<PipelineNodeData> | null;
  onUpdateConfig: (nodeId: string, config: Record<string, string>) => void;
}

const CONFIG_MAP = {
  trigger: TriggerConfig,
  llm: LLMConfig,
  filter: FilterConfig,
  httpRequest: HttpRequestConfig,
  transform: DataTransformConfig,
  webhook: WebhookConfig,
} as const;

export function NodeConfigPanel({ node, onUpdateConfig }: Props) {
  if (!node) {
    return (
      <aside className="w-72 flex-shrink-0 bg-black/40 border-l border-white/10 flex items-center justify-center">
        <p className="text-xs text-white/20 text-center px-4">Click a node to configure it</p>
      </aside>
    );
  }

  const nodeType = node.data.nodeType;
  const ConfigComponent = CONFIG_MAP[nodeType];

  return (
    <aside className="w-72 flex-shrink-0 bg-black/40 border-l border-white/10 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-white/10">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Configure</p>
        <p className="text-sm font-bold text-white mt-0.5">{node.data.label}</p>
      </div>
      <div className="p-4 flex-1">
        {ConfigComponent ? (
          <ConfigComponent config={node.data.config} onChange={(config) => onUpdateConfig(node.id, config)} />
        ) : (
          <p className="text-xs text-white/30">No configuration for this node type.</p>
        )}
      </div>
    </aside>
  );
}
