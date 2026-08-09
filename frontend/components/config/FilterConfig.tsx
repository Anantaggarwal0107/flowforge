"use client";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function FilterConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-semibold text-muted-foreground">Expression</label>
        <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>python</span>
      </div>
      <input
        className="w-full bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[11px] leading-[1.6] text-foreground outline-none focus:border-primary transition-colors"
        placeholder="data['score'] > 0.5"
        value={config.expression ?? "True"}
        onChange={(e) => onChange({ ...config, expression: e.target.value })}
      />
      <p className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>
        Use <code>data["key"]</code> or bare field names. Pipeline stops if falsy.
      </p>
    </div>
  );
}
