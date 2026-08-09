"use client";
import { type NodeProps, type Node } from "@xyflow/react";
import { Shuffle } from "lucide-react";
import { BaseNode } from "./BaseNode";
import type { PipelineNodeData } from "@/lib/types";

export function DataTransformNode(props: NodeProps<Node<PipelineNodeData>>) {
  const template = props.data.config?.template ?? "{}";
  const keys = (() => {
    try {
      const obj = JSON.parse(template);
      const k = Object.keys(obj).length;
      return k > 0 ? `${k} key${k > 1 ? "s" : ""} mapped` : "template configured";
    } catch {
      return "template configured";
    }
  })();
  return (
    <BaseNode {...props} icon={<Shuffle size={14} />}>
      {keys}
    </BaseNode>
  );
}
