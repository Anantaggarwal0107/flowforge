"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function HttpRequestConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-end">
        <div className="w-24">
          <Label className="text-xs text-white/60">Method</Label>
          <select
            className="mt-1 h-8 w-full rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={config.method || "GET"}
            onChange={(e) => onChange({ ...config, method: e.target.value })}
          >
            {["GET", "POST", "PUT", "DELETE"].map((m) => (
              <option key={m} value={m} className="bg-neutral-900">{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Label className="text-xs text-white/60">URL</Label>
          <Input className="mt-1 h-8 text-xs font-mono bg-white/5 border-white/10" placeholder="https://api.example.com/{{id}}" value={config.url ?? ""} onChange={(e) => onChange({ ...config, url: e.target.value })} />
        </div>
      </div>
      <div>
        <Label className="text-xs text-white/60">Headers (JSON)</Label>
        <Textarea className="font-mono text-xs min-h-[60px] mt-1 bg-white/5 border-white/10" placeholder='{"Authorization": "Bearer token"}' value={config.headers ?? "{}"} onChange={(e) => onChange({ ...config, headers: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs text-white/60">Body (JSON + templates)</Label>
        <Textarea className="font-mono text-xs min-h-[60px] mt-1 bg-white/5 border-white/10" placeholder='{"message": "{{response}}"}' value={config.body ?? ""} onChange={(e) => onChange({ ...config, body: e.target.value })} />
      </div>
    </div>
  );
}
