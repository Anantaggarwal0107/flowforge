"use client";
import { useState } from "react";
import type { NodeExecution } from "@/lib/types";

const STATUS_BADGE: Record<NodeExecution["status"], { color: string; bg: string }> = {
  pending: { color: "var(--faint)",  bg: "var(--accent)" },
  running: { color: "#fbbf24",       bg: "rgba(251,191,36,.14)" },
  done:    { color: "#34d399",       bg: "rgba(52,211,153,.14)" },
  error:   { color: "#f87171",       bg: "rgba(248,113,113,.14)" },
};

function makeTimestamp(i: number, total: number): string {
  const now = new Date();
  const offsetMs = (total - i) * 900;
  const t = new Date(now.getTime() - offsetMs);
  const ms = String(100 + i * 37).slice(0, 3);
  return t.toLocaleTimeString("en-GB", { hour12: false }) + "." + ms;
}

interface Props { executions: NodeExecution[]; }

export function ExecutionLog({ executions }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const errorCount = executions.filter((e) => e.status === "error").length;
  const doneCount  = executions.filter((e) => e.status === "done").length;

  const summary =
    executions.length === 0
      ? "no runs yet"
      : `${doneCount} done, ${errorCount} error${errorCount !== 1 ? "s" : ""}`;

  return (
    <div className="flex-shrink-0 bg-card border-t border-border">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full h-[38px] flex items-center gap-3 px-4 bg-transparent text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-[.14em]">Execution Log</span>
        <span className="font-mono text-[10.5px]" style={{ color: "var(--faint)" }}>{summary}</span>
        <span className="flex-1" />
        <span className="font-mono text-[10px]" style={{ color: "var(--faint)" }}>
          {open ? "hide ▾" : "show ▴"}
        </span>
      </button>

      {open && executions.length > 0 && (
        <div className="max-h-[172px] overflow-y-auto border-t border-border">
          {executions.map((ex, i) => {
            const badge = STATUS_BADGE[ex.status];
            const time = makeTimestamp(i, executions.length);
            return (
              <div key={ex.nodeId} className="row-enter">
                <div
                  className="flex items-center gap-3.5 px-4 py-2 border-b border-border cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setExpanded(expanded === ex.nodeId ? null : ex.nodeId)}
                >
                  {/* time */}
                  <span className="font-mono text-[10px] w-24 flex-shrink-0" style={{ color: "var(--faint)" }}>
                    {time}
                  </span>
                  {/* nodeId */}
                  <span className="font-mono text-[10px] w-[150px] flex-shrink-0 truncate text-foreground">
                    {ex.nodeId}
                  </span>
                  {/* status badge */}
                  <span
                    className="font-mono text-[9px] font-bold uppercase tracking-[.07em] px-[7px] py-0.5 rounded-[5px] flex-shrink-0"
                    style={{ color: badge.color, background: badge.bg }}
                  >
                    {ex.status}
                  </span>
                  {/* detail */}
                  <span className="font-mono text-[10px] text-muted-foreground flex-1 truncate min-w-0">
                    {ex.error ?? ""}
                  </span>
                  {/* duration */}
                  {ex.duration_ms !== undefined && (
                    <span className="font-mono text-[10px] flex-shrink-0" style={{ color: "var(--faint)" }}>
                      {ex.duration_ms}ms
                    </span>
                  )}
                </div>
                {expanded === ex.nodeId && (ex.output !== undefined || ex.error) && (
                  <pre className="mx-4 my-2 bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[10px] leading-[1.65] text-muted-foreground whitespace-pre-wrap break-words overflow-x-auto">
                    {ex.error
                      ? ex.error
                      : JSON.stringify(ex.output, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
