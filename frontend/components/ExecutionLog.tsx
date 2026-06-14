"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NodeExecution } from "@/lib/types";

const STATUS_BADGE: Record<NodeExecution["status"], string> = {
  pending: "bg-white/10 text-white/40",
  running: "bg-yellow-500/20 text-yellow-300",
  done: "bg-emerald-500/20 text-emerald-300",
  error: "bg-red-500/20 text-red-300",
};

interface Props { executions: NodeExecution[]; }

export function ExecutionLog({ executions }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (executions.length === 0) return null;

  return (
    <div className="border-t border-white/10 bg-black/60 flex-shrink-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-2 text-xs text-white/50 hover:text-white/80 transition-colors">
        <span className="font-semibold uppercase tracking-widest">Execution Log ({executions.length} nodes)</span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
          {executions.map((ex) => (
            <div key={ex.nodeId} className="px-4 py-2">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === ex.nodeId ? null : ex.nodeId)}>
                <span className="font-mono text-[10px] text-white/40 w-32 truncate">{ex.nodeId}</span>
                <Badge className={`text-[10px] ${STATUS_BADGE[ex.status]}`}>{ex.status}</Badge>
                {ex.duration_ms !== undefined && <span className="text-[10px] text-white/30 ml-auto">{ex.duration_ms}ms</span>}
                {ex.error && <span className="text-[10px] text-red-400 ml-auto truncate max-w-[200px]">{ex.error}</span>}
              </div>
              {expanded === ex.nodeId && (ex.output || ex.error) && (
                <pre className="mt-2 text-[10px] text-white/60 bg-white/5 rounded p-2 overflow-x-auto">
                  {ex.error ? ex.error : JSON.stringify(ex.output, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
