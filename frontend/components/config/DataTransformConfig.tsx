"use client";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

export function DataTransformConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-semibold text-muted-foreground">Output Template</label>
        <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>jinja2</span>
      </div>
      <textarea
        className="w-full resize-none bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[11px] leading-[1.6] text-foreground outline-none focus:border-primary transition-colors"
        rows={7}
        placeholder={'{\n  "greeting": "Hello {{name}}"\n}'}
        value={config.template ?? "{}"}
        onChange={(e) => onChange({ ...config, template: e.target.value })}
      />
      <p className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>
        Use {"{{field}}"} or {"{{nested.field}}"} to reference input values.
      </p>
    </div>
  );
}
