"use client";
import { useState, useEffect, useRef } from "react";
import { Save, Play, Plus, Loader2, ChevronDown, BookOpen, Shuffle, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { listPipelines } from "@/lib/api";
import type { ExecutionStatus, NodeExecution } from "@/lib/types";
import { EXAMPLE_TEMPLATES, type PipelineTemplate } from "@/lib/examples";

interface PipelineSummary { id: number; name: string; created_at: string; }

interface Props {
  pipelineName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
  onNew: () => void;
  onLoad: (id: number) => void;
  onLoadExample: (template: PipelineTemplate) => void;
  executionStatus: ExecutionStatus;
  isSaving: boolean;
  executions?: Map<string, NodeExecution>;
}

function RunStatusPill({ executionStatus, executions }: { executionStatus: ExecutionStatus; executions?: Map<string, NodeExecution> }) {
  const count = executions?.size ?? 0;
  let dotColor = "var(--faint)";
  let text = "idle · dag valid";
  let pulse = false;

  if (executionStatus === "running") {
    dotColor = "var(--color-status-running)";
    text = `executing · ${count}`;
    pulse = true;
  } else if (executionStatus === "done") {
    dotColor = "var(--color-status-done)";
    text = "completed";
  } else if (executionStatus === "error") {
    dotColor = "var(--color-status-error)";
    text = "error";
  }

  return (
    <div className="flex items-center gap-[7px] px-[11px] py-[5px] rounded-full bg-accent border border-border">
      <span
        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        style={{
          backgroundColor: dotColor,
          animation: pulse ? "ffin 0.9s ease-in-out infinite alternate" : "none",
        }}
      />
      <span className="font-mono text-[10px] text-muted-foreground tracking-[.02em]">{text}</span>
    </div>
  );
}

export function PipelineToolbar({
  pipelineName, onNameChange, onSave, onRun, onNew, onLoad, onLoadExample,
  executionStatus, isSaving, executions,
}: Props) {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    listPipelines().then((data) => setPipelines(data as PipelineSummary[])).catch(console.error);
  }, [isSaving]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const isRunning = executionStatus === "running";

  const EXAMPLE_NAMES = EXAMPLE_TEMPLATES.map((t) => t.name);
  const savedPipelines = pipelines.filter((p) => !EXAMPLE_NAMES.includes(p.name));

  return (
    <header className="h-14 flex items-center gap-3.5 px-4 bg-card border-b border-border flex-shrink-0 z-20">
      {/* Brand lockup */}
      <div className="flex items-center gap-[10px]">
        <div
          className="w-7 h-7 rounded-[9px] grid place-items-center flex-shrink-0"
          style={{
            background: "linear-gradient(145deg,#818cf8,#4f46e5)",
            boxShadow: "0 4px 14px -4px rgba(79,70,229,.8)",
          }}
        >
          <Shuffle size={15} color="#fff" strokeWidth={2.4} />
        </div>
        <div className="flex flex-col leading-[1.15]">
          <span className="text-sm font-bold tracking-tight">FlowForge</span>
          <span className="text-[9px] uppercase tracking-[.09em]" style={{ color: "var(--faint)" }}>
            Visual AI Pipeline Builder
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-[22px] bg-border" />

      {/* Pipeline name pill */}
      <div
        className="flex items-center gap-2 h-8 px-3 rounded-[9px] bg-accent border border-border cursor-text"
        onClick={() => setEditing(true)}
      >
        {editing ? (
          <input
            ref={inputRef}
            className="text-[13px] font-semibold bg-transparent outline-none text-foreground min-w-0 w-40"
            value={pipelineName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
          />
        ) : (
          <span className="text-[13px] font-semibold text-foreground truncate max-w-[160px]">{pipelineName}</span>
        )}
        <span
          className="text-[9px] font-semibold border border-input rounded-[5px] px-1.5 py-[1px] flex-shrink-0"
          style={{ color: "var(--faint)" }}
        >
          v1
        </span>
      </div>

      {/* Examples dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 px-[11px] rounded-[9px] border-0 bg-transparent text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center gap-[6px]">
          <BookOpen size={13} />
          Examples
          <ChevronDown size={11} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {EXAMPLE_TEMPLATES.map((t) => (
            <DropdownMenuItem key={t.name} onClick={() => onLoadExample(t)}>
              {t.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Load dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 px-[11px] rounded-[9px] border-0 bg-transparent text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center gap-[6px]">
          Load
          <ChevronDown size={11} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {savedPipelines.length === 0 ? (
            <DropdownMenuItem disabled>No saved pipelines</DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest px-2 py-1" style={{ color: "var(--faint)" }}>
                My Pipelines
              </DropdownMenuLabel>
              {savedPipelines.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => onLoad(p.id)}>{p.name}</DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {/* Run status pill */}
      <RunStatusPill executionStatus={executionStatus} executions={executions} />

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-8 h-8 rounded-[9px] border border-border bg-accent text-muted-foreground grid place-items-center hover:text-foreground hover:border-input transition-colors flex-shrink-0"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* New */}
      <button
        onClick={onNew}
        className="h-8 px-[11px] rounded-[9px] border border-border bg-transparent text-muted-foreground text-xs font-medium flex items-center gap-[6px] hover:text-foreground hover:border-input transition-colors"
      >
        <Plus size={12} />
        New
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="h-8 px-[12px] rounded-[9px] border border-input bg-popover text-foreground text-xs font-semibold flex items-center gap-[6px] hover:border-primary transition-colors disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        Save
      </button>

      {/* Run */}
      <button
        onClick={onRun}
        disabled={isRunning}
        className="h-8 px-[15px] rounded-[9px] text-xs font-bold text-white flex items-center gap-[7px] disabled:opacity-70 transition-all hover:brightness-110"
        style={{
          background: "linear-gradient(180deg,#6366f1,#4f46e5)",
          boxShadow: "0 6px 18px -6px rgba(79,70,229,.9)",
        }}
      >
        {isRunning
          ? <Loader2 size={12} className="animate-spin" />
          : <Play size={12} fill="currentColor" />}
        {isRunning ? "Running…" : executionStatus === "done" ? "Run again" : "Run"}
      </button>
    </header>
  );
}
