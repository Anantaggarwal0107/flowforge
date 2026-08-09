"use client";
import { useState } from "react";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function TriggerConfig({ config, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const handleBlur = (val: string) => {
    try { JSON.parse(val || "{}"); setError(null); } catch { setError("Invalid JSON"); }
  };
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-semibold text-muted-foreground">Initial JSON Payload</label>
        <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>json</span>
      </div>
      <textarea
        className="w-full resize-none bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[11px] leading-[1.6] text-foreground outline-none focus:border-primary transition-colors"
        rows={6}
        placeholder='{"key": "value"}'
        value={config.payload ?? "{}"}
        onChange={(e) => onChange({ ...config, payload: e.target.value })}
        onBlur={(e) => handleBlur(e.target.value)}
      />
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
