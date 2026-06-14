"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function LLMConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-xs text-white/60">System Prompt</Label>
        <Textarea className="text-xs min-h-[80px] mt-1 bg-white/5 border-white/10" placeholder="You are a helpful assistant." value={config.system_prompt ?? ""} onChange={(e) => onChange({ ...config, system_prompt: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs text-white/60">User Prompt</Label>
        <Textarea className="font-mono text-xs min-h-[80px] mt-1 bg-white/5 border-white/10" placeholder="Summarize: {{input}}" value={config.user_prompt ?? "{{input}}"} onChange={(e) => onChange({ ...config, user_prompt: e.target.value })} />
        <p className="text-[10px] text-white/30 mt-1">Use {"{{field}}"} to reference input fields.</p>
      </div>
    </div>
  );
}
