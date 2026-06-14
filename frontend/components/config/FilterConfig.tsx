"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function FilterConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-white/60">Python Boolean Expression</Label>
      <Input className="font-mono text-xs bg-white/5 border-white/10" placeholder="data['score'] > 0.5" value={config.expression ?? "True"} onChange={(e) => onChange({ ...config, expression: e.target.value })} />
      <p className="text-[10px] text-white/30">Use <code>data["key"]</code> or bare field names. Pipeline stops if falsy.</p>
    </div>
  );
}
