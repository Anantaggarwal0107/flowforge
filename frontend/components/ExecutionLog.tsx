"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NodeExecution } from "@/lib/types";

const STATUS_BADGE: Record<NodeExecution["status"], string> = {
  pending: "bg-white/10 text-white/40",
  running: "bg-yellow-500/20 text-yellow-300",
  done: "bg-emerald-500/20 text-emerald-300",
  error: "bg-red-500/20 text-red-300",
};

const ROW_BG: Record<NodeExecution["status"], string> = {
  pending: "",
  running: "bg-yellow-500/5",
  done: "bg-emerald-500/5",
  error: "bg-red-500/10",
};

const OUTPUT_BG: Record<NodeExecution["status"], string> = {
  pending: "bg-white/5",
  running: "bg-yellow-500/10",
  done: "bg-emerald-500/10 border border-emerald-500/20",
  error: "bg-red-500/10 border border-red-500/20",
};

interface Props { executions: NodeExecution[]; }

export function ExecutionLog({ executions }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (executions.length === 0) return null;

  const errorCount = executions.filter((e) => e.status === "error").length;
  const doneCount = executions.filter((e) => e.status === "done").length;

  return (
    <div className="border-t border-white/10 bg-black/60 flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-white/50 hover:text-white/80 transition-colors"
      >
        <span className="font-semibold uppercase tracking-widest flex items-center gap-2">
          Execution Log
          <span className="text-white/30 font-normal normal-case tracking-normal">
            {doneCount} done{errorCount > 0 ? `, ${errorCount} error${errorCount > 1 ? "s" : ""}` : ""}
          </span>
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      {open && (
        <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
          {executions.map((ex) => (
            <div key={ex.nodeId} className={`px-4 py-2 transition-colors ${ROW_BG[ex.status]}`}>
              <div
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => setExpanded(expanded === ex.nodeId ? null : ex.nodeId)}
              >
                <span className="font-mono text-[10px] text-white/40 w-36 truncate">{ex.nodeId}</span>
                <Badge className={`text-[10px] shrink-0 ${STATUS_BADGE[ex.status]}`}>{ex.status}</Badge>
                {ex.duration_ms !== undefined && (
                  <span className="text-[10px] text-white/40 flex items-center gap-1 shrink-0">
                    <Clock size={9} />
                    {ex.duration_ms}ms
                  </span>
                )}
                {ex.error && (
                  <span className="text-[10px] text-red-400 ml-auto truncate max-w-[240px]">{ex.error}</span>
                )}
                <span className="ml-auto text-white/20 text-[10px] shrink-0">
                  {expanded === ex.nodeId ? "▲" : "▼"}
                </span>
              </div>
              {expanded === ex.nodeId && (ex.output !== undefined || ex.error) && (
                <pre
                  className={`mt-2 text-[10px] rounded p-3 overflow-x-auto leading-relaxed ${
                    ex.error ? OUTPUT_BG.error : OUTPUT_BG[ex.status]
                  } ${ex.error ? "text-red-300" : "text-emerald-200"}`}
                >
                  {ex.error
                    ? ex.error
                    : JSON.stringify(ex.output, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
