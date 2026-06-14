"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function DataTransformConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-white/60">JSON Output Template</Label>
      <Textarea className="font-mono text-xs min-h-[140px] bg-white/5 border-white/10" placeholder={'{\n  "greeting": "Hello {{name}}"\n}'} value={config.template ?? "{}"} onChange={(e) => onChange({ ...config, template: e.target.value })} />
      <p className="text-[10px] text-white/30">Use {"{{field}}"} or {"{{nested.field}}"} to reference input values.</p>
    </div>
  );
}
