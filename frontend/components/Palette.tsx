"use client";
import { Play, Sparkles, Filter, Globe, Shuffle, Webhook } from "lucide-react";

const NODE_TYPES = [
  { type: "trigger", label: "Trigger", icon: <Play size={16} />, description: "Start with a JSON payload", color: "text-emerald-400" },
  { type: "llm", label: "LLM Transform", icon: <Sparkles size={16} />, description: "Groq AI completion", color: "text-violet-400" },
  { type: "filter", label: "Filter", icon: <Filter size={16} />, description: "Boolean expression gate", color: "text-yellow-400" },
  { type: "httpRequest", label: "HTTP Request", icon: <Globe size={16} />, description: "Outbound API call", color: "text-blue-400" },
  { type: "transform", label: "Data Transform", icon: <Shuffle size={16} />, description: "Reshape JSON with templates", color: "text-orange-400" },
  { type: "webhook", label: "Webhook Output", icon: <Webhook size={16} />, description: "POST result to a URL", color: "text-pink-400" },
];

export function Palette() {
  const onDragStart = (e: React.DragEvent, type: string, label: string) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify({ type, label }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-black/40 border-r border-white/10 flex flex-col gap-1 p-3 overflow-y-auto">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 px-1">Nodes</p>
      {NODE_TYPES.map((n) => (
        <div
          key={n.type}
          draggable
          onDragStart={(e) => onDragStart(e, n.type, n.label)}
          className="flex items-start gap-3 rounded-lg px-3 py-2 cursor-grab border border-white/10 bg-white/5 hover:bg-white/10 transition-colors select-none"
        >
          <span className={`mt-0.5 flex-shrink-0 ${n.color}`}>{n.icon}</span>
          <div>
            <p className="text-xs font-semibold text-white/80">{n.label}</p>
            <p className="text-[10px] text-white/40">{n.description}</p>
          </div>
        </div>
      ))}
    </aside>
  );
}
