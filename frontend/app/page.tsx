"use client";
import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";

import { nodeTypes } from "@/lib/nodeTypes";
import type { PipelineNodeData, NodeExecution, ExecutionStatus, SSEEvent } from "@/lib/types";
import { createPipeline, updatePipeline, getPipeline, runPipeline } from "@/lib/api";

import { Palette } from "@/components/Palette";
import { NodeConfigPanel } from "@/components/config/NodeConfigPanel";
import { ExecutionLog } from "@/components/ExecutionLog";
import { PipelineToolbar } from "@/components/PipelineToolbar";

const DEFAULT_NODE_CONFIGS: Record<string, Record<string, string>> = {
  trigger: { payload: "{}" },
  llm: { system_prompt: "You are a helpful assistant.", user_prompt: "{{input}}" },
  filter: { expression: "True" },
  httpRequest: { method: "GET", url: "", headers: "{}", body: "" },
  transform: { template: "{}" },
  webhook: { url: "" },
};

const DEFAULT_LABELS: Record<string, string> = {
  trigger: "Trigger",
  llm: "LLM Transform",
  filter: "Filter",
  httpRequest: "HTTP Request",
  transform: "Data Transform",
  webhook: "Webhook Output",
};

export default function FlowForgePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PipelineNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<PipelineNodeData> | null>(null);
  const [executions, setExecutions] = useState<Map<string, NodeExecution>>(new Map());
  const [pipelineId, setPipelineId] = useState<number | null>(null);
  const [pipelineName, setPipelineName] = useState("Untitled Pipeline");
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rfInstance = useRef<any>(null);

  const nodesWithExecution = nodes.map((n) => ({
    ...n,
    data: { ...n.data, execution: executions.get(n.id) },
  }));

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => setSelectedNode(node as Node<PipelineNodeData>),
    []
  );

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/reactflow");
      if (!raw || !rfInstance.current || !reactFlowWrapper.current) return;
      const { type, label } = JSON.parse(raw) as { type: string; label: string };

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const newNode: Node<PipelineNodeData> = {
        id: crypto.randomUUID(),
        type,
        position,
        data: {
          label: label ?? DEFAULT_LABELS[type] ?? type,
          nodeType: type as PipelineNodeData["nodeType"],
          config: { ...(DEFAULT_NODE_CONFIGS[type] ?? {}) },
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleUpdateConfig = useCallback(
    (nodeId: string, config: Record<string, string>) => {
      setNodes((nds) =>
        nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n)
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, config } } : prev
      );
    },
    [setNodes]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (pipelineId) {
        await updatePipeline(pipelineId, pipelineName, nodes, edges);
        toast.success("Pipeline saved");
      } else {
        const created = await createPipeline(pipelineName, nodes, edges);
        setPipelineId(created.id);
        toast.success("Pipeline created");
      }
    } catch (err) {
      toast.error("Save failed: " + String(err));
    } finally {
      setIsSaving(false);
    }
  }, [pipelineId, pipelineName, nodes, edges]);

  const handleLoad = useCallback(async (id: number) => {
    try {
      const pipeline = await getPipeline(id);
      setNodes(pipeline.nodes ?? []);
      setEdges(pipeline.edges ?? []);
      setPipelineId(pipeline.id);
      setPipelineName(pipeline.name);
      setExecutions(new Map());
      setSelectedNode(null);
      toast.success(`Loaded: ${pipeline.name}`);
    } catch (err) {
      toast.error("Load failed: " + String(err));
    }
  }, [setNodes, setEdges]);

  const handleNew = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setPipelineId(null);
    setPipelineName("Untitled Pipeline");
    setExecutions(new Map());
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    setExecutions((prev) => {
      const next = new Map(prev);
      switch (event.type) {
        case "node_start":
          next.set(event.node_id, { nodeId: event.node_id, status: "running" });
          break;
        case "node_done":
          next.set(event.node_id, { nodeId: event.node_id, status: "done", output: event.output, duration_ms: event.duration_ms });
          break;
        case "node_error":
          next.set(event.node_id, { nodeId: event.node_id, status: "error", error: event.error });
          setExecutionStatus("error");
          break;
        case "done":
          setExecutionStatus("done");
          toast.success("Pipeline completed");
          break;
      }
      return next;
    });
  }, []);

  const handleRun = useCallback(async () => {
    if (!pipelineId) {
      toast.error("Save the pipeline before running");
      return;
    }
    setExecutionStatus("running");
    setExecutions(new Map());
    try {
      for await (const event of runPipeline(pipelineId)) {
        handleSSEEvent(event);
      }
    } catch (err) {
      toast.error("Run failed: " + String(err));
      setExecutionStatus("error");
    }
  }, [pipelineId, handleSSEEvent]);

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      <PipelineToolbar
        pipelineName={pipelineName}
        onNameChange={setPipelineName}
        onSave={handleSave}
        onRun={handleRun}
        onNew={handleNew}
        onLoad={handleLoad}
        executionStatus={executionStatus}
        isSaving={isSaving}
      />
      <div className="flex flex-1 overflow-hidden">
        <Palette />
        <div ref={reactFlowWrapper} className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodesWithExecution}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={(instance) => { rfInstance.current = instance; }}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#1a1a1a" gap={24} />
            <Controls />
            <MiniMap nodeColor="#333" maskColor="rgba(0,0,0,0.6)" />
          </ReactFlow>
        </div>
        <NodeConfigPanel node={selectedNode} onUpdateConfig={handleUpdateConfig} />
      </div>
      <ExecutionLog executions={Array.from(executions.values())} />
    </div>
  );
}
