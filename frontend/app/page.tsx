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
import type { PipelineTemplate } from "@/lib/examples";

import { Palette } from "@/components/Palette";
import { NodeConfigPanel } from "@/components/config/NodeConfigPanel";
import { ExecutionLog } from "@/components/ExecutionLog";
import { PipelineToolbar } from "@/components/PipelineToolbar";

const DEFAULT_NODE_CONFIGS: Record<string, Record<string, string>> = {
  trigger:     { payload: "{}" },
  llm:         { system_prompt: "You are a helpful assistant.", user_prompt: "{{input}}" },
  filter:      { expression: "True" },
  httpRequest: { method: "GET", url: "", headers: "{}", body: "" },
  transform:   { template: "{}" },
  webhook:     { url: "" },
};

const DEFAULT_LABELS: Record<string, string> = {
  trigger:     "Trigger",
  llm:         "LLM Transform",
  filter:      "Filter",
  httpRequest: "HTTP Request",
  transform:   "Data Transform",
  webhook:     "Webhook Output",
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

  const handleLoadExample = useCallback((template: PipelineTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setPipelineId(null);
    setPipelineName(template.name);
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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <PipelineToolbar
        pipelineName={pipelineName}
        onNameChange={setPipelineName}
        onSave={handleSave}
        onRun={handleRun}
        onNew={handleNew}
        onLoad={handleLoad}
        onLoadExample={handleLoadExample}
        executionStatus={executionStatus}
        isSaving={isSaving}
        executions={executions}
      />
      <div className="flex flex-1 min-h-0">
        <Palette nodes={nodes} edges={edges} />
        <div ref={reactFlowWrapper} className="flex-1 relative min-w-0" onDrop={onDrop} onDragOver={onDragOver}>
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div
                className="rounded-2xl border border-border px-10 py-8 max-w-sm w-full"
                style={{ background: "var(--card)", opacity: 0.8, boxShadow: "var(--shadow-panel)" }}
              >
                <h2 className="text-base font-semibold mb-5 text-center text-foreground">Build your first pipeline</h2>
                <ol className="flex flex-col gap-3">
                  {[
                    <>Drag a <span className="font-semibold">Trigger</span> node from the left panel</>,
                    <>Add processing nodes <span className="text-muted-foreground">(LLM, Filter, HTTP…)</span></>,
                    <>Connect nodes by dragging from one handle to another</>,
                    <>Click <span className="font-semibold" style={{ color: "var(--primary)" }}>Run</span> to execute</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 bg-accent text-muted-foreground"
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 text-[10px] text-center" style={{ color: "var(--faint)" }}>
                  Or load an example from the toolbar above
                </p>
              </div>
            </div>
          )}
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
            <Background gap={22} />
            <Controls />
            <MiniMap nodeColor="var(--card)" maskColor="rgba(8,9,12,0.6)" />
          </ReactFlow>
        </div>
        <NodeConfigPanel
          node={selectedNode}
          onUpdateConfig={handleUpdateConfig}
          executions={executions}
        />
      </div>
      <ExecutionLog executions={Array.from(executions.values())} />
    </div>
  );
}
