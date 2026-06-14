# FlowForge

A visual AI pipeline builder. Drag nodes onto a canvas, wire them together, configure each, save your pipeline, and watch it execute node-by-node with live status updates streamed back via SSE.

## Features

- 6 node types: Trigger, LLM Transform (Groq), Filter, HTTP Request, Data Transform, Webhook Output
- ReactFlow drag-and-drop canvas with dark theme
- Right-panel node configuration forms
- Topological execution order with cycle detection
- Live SSE streaming — nodes animate yellow (running) → green (done) or red (error)
- Execution log drawer with per-node output and timing
- Named pipelines saved to SQLite, loadable from toolbar dropdown

## Quickstart

```bash
cp .env.example .env
# Add your GROQ_API_KEY to .env
docker compose up --build
```

Open http://localhost:3000

## 2-Minute Demo

1. Drag a **Trigger** node → payload: `{"name": "FlowForge", "score": 0.9}`
2. Drag a **Filter** node → expression: `data['score'] > 0.5`
3. Drag an **LLM Transform** → user prompt: `Write a welcome message for {{name}}`
4. Drag a **Webhook Output** → paste a URL from webhook.site
5. Connect: Trigger → Filter → LLM → Webhook
6. Click Save, then Run
7. Watch nodes animate yellow → green
8. Open Execution Log to see the LLM response
9. Check webhook.site — AI output landed there

## Stack

- Next.js 14, TypeScript, ReactFlow (@xyflow/react), shadcn/ui, Tailwind
- Python FastAPI, SQLModel, SQLite, Groq SDK, httpx
- Docker Compose
