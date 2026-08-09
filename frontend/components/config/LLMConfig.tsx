"use client";

interface Props { config: Record<string, string>; onChange: (config: Record<string, string>) => void; }

const fieldClass = "w-full resize-none bg-muted border border-border rounded-[9px] px-[11px] py-[9px] font-mono text-[11px] leading-[1.6] text-foreground outline-none focus:border-primary transition-colors";

export function LLMConfig({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">System Prompt</label>
          <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>text</span>
        </div>
        <textarea
          className={fieldClass}
          rows={4}
          placeholder="You are a helpful assistant."
          value={config.system_prompt ?? ""}
          onChange={(e) => onChange({ ...config, system_prompt: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">User Prompt</label>
          <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>template</span>
        </div>
        <textarea
          className={fieldClass}
          rows={3}
          placeholder="Summarize: {{input}}"
          value={config.user_prompt ?? "{{input}}"}
          onChange={(e) => onChange({ ...config, user_prompt: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">Temperature</label>
          <span className="font-mono text-[9px]" style={{ color: "var(--faint)" }}>float</span>
        </div>
        <input
          className={`${fieldClass} resize-none`}
          type="text"
          placeholder="0.7"
          value={config.temperature ?? "0.7"}
          onChange={(e) => onChange({ ...config, temperature: e.target.value })}
        />
      </div>
    </div>
  );
}
