"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function WebhookConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-white/60">Target URL</Label>
      <Input className="font-mono text-xs bg-white/5 border-white/10" placeholder="https://webhook.site/your-unique-id" value={config.url ?? ""} onChange={(e) => onChange({ ...config, url: e.target.value })} />
      <p className="text-[10px] text-white/30">The pipeline output will be POSTed as JSON to this URL.</p>
    </div>
  );
}
