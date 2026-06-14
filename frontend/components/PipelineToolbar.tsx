"use client";
import { useState, useEffect } from "react";
import { Save, Play, Plus, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { listPipelines } from "@/lib/api";
import type { ExecutionStatus } from "@/lib/types";

interface PipelineSummary { id: number; name: string; created_at: string; }

interface Props {
  pipelineName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
  onNew: () => void;
  onLoad: (id: number) => void;
  executionStatus: ExecutionStatus;
  isSaving: boolean;
}

export function PipelineToolbar({ pipelineName, onNameChange, onSave, onRun, onNew, onLoad, executionStatus, isSaving }: Props) {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);

  useEffect(() => {
    listPipelines().then((data) => setPipelines(data as PipelineSummary[])).catch(console.error);
  }, [isSaving]);

  const isRunning = executionStatus === "running";

  return (
    <header className="h-12 flex items-center gap-3 px-4 border-b border-white/10 bg-black/60 flex-shrink-0">
      <Input className="h-7 w-56 text-sm bg-white/5 border-white/10 text-white" value={pipelineName} onChange={(e) => onNameChange(e.target.value)} placeholder="Untitled Pipeline" />
      <DropdownMenu>
        <DropdownMenuTrigger className="h-7 text-xs px-2 rounded-md hover:bg-white/10 transition-colors text-white/70 flex items-center gap-1">
          Load <ChevronDown size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {pipelines.length === 0 && <DropdownMenuItem disabled>No saved pipelines</DropdownMenuItem>}
          {pipelines.map((p) => <DropdownMenuItem key={p.id} onClick={() => onLoad(p.id)}>{p.name}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onNew}><Plus size={12} /> New</Button>
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onSave} disabled={isSaving}>
        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
      </Button>
      <Button size="sm" className="h-7 text-xs gap-1 bg-indigo-600 hover:bg-indigo-500" onClick={onRun} disabled={isRunning}>
        {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
        {isRunning ? "Running…" : "Run"}
      </Button>
    </header>
  );
}
