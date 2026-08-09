"use client";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function WebhookConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-semibold text-muted-foreground">Target URL</label>
        <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>url</span>
      </div>
      <input
        className="w-full bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[11px] leading-[1.6] text-foreground outline-none focus:border-primary transition-colors"
        placeholder="https://webhook.site/your-unique-id"
        value={config.url ?? ""}
        onChange={(e) => onChange({ ...config, url: e.target.value })}
      />
      <p className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>
        The pipeline output will be POSTed as JSON to this URL.
      </p>
    </div>
  );
}
