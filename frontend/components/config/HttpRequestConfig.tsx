"use client";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

const fieldClass = "w-full bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[11px] leading-[1.6] text-foreground outline-none focus:border-primary transition-colors";

export function HttpRequestConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2 items-end">
        <div className="w-[88px] flex flex-col gap-[6px]">
          <div className="flex items-baseline justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground">Method</label>
            <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>enum</span>
          </div>
          <select
            className={fieldClass}
            value={config.method || "GET"}
            onChange={(e) => onChange({ ...config, method: e.target.value })}
          >
            {["GET", "POST", "PUT", "DELETE"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-[6px]">
          <div className="flex items-baseline justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground">URL</label>
            <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>template</span>
          </div>
          <input
            className={fieldClass}
            placeholder="https://api.example.com/{{id}}"
            value={config.url ?? ""}
            onChange={(e) => onChange({ ...config, url: e.target.value })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">Headers</label>
          <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>json</span>
        </div>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={3}
          placeholder='{"Authorization": "Bearer token"}'
          value={config.headers ?? "{}"}
          onChange={(e) => onChange({ ...config, headers: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">Body</label>
          <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>json</span>
        </div>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={3}
          placeholder='{"message": "{{response}}"}'
          value={config.body ?? ""}
          onChange={(e) => onChange({ ...config, body: e.target.value })}
        />
      </div>
    </div>
  );
}
