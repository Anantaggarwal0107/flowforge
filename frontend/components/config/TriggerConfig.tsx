"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function TriggerConfig({ config, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const handleBlur = (val: string) => {
    try { JSON.parse(val || "{}"); setError(null); } catch { setError("Invalid JSON"); }
  };
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-white/60">Initial JSON Payload</Label>
      <Textarea
        className="font-mono text-xs min-h-[120px] bg-white/5 border-white/10"
        placeholder='{"key": "value"}'
        value={config.payload ?? "{}"}
        onChange={(e) => onChange({ ...config, payload: e.target.value })}
        onBlur={(e) => handleBlur(e.target.value)}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
