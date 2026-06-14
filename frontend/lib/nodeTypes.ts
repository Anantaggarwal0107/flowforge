import { TriggerNode } from "@/components/nodes/TriggerNode";
import { LLMNode } from "@/components/nodes/LLMNode";
import { FilterNode } from "@/components/nodes/FilterNode";
import { HttpRequestNode } from "@/components/nodes/HttpRequestNode";
import { DataTransformNode } from "@/components/nodes/DataTransformNode";
import { WebhookNode } from "@/components/nodes/WebhookNode";
import type { NodeTypes } from "@xyflow/react";

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode as NodeTypes[string],
  llm: LLMNode as NodeTypes[string],
  filter: FilterNode as NodeTypes[string],
  httpRequest: HttpRequestNode as NodeTypes[string],
  transform: DataTransformNode as NodeTypes[string],
  webhook: WebhookNode as NodeTypes[string],
};
