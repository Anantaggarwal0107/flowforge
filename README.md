# FlowForge

Visual AI pipeline orchestrator — build, validate, and run multi-step AI workflows by connecting nodes on a drag-and-drop canvas.

## What it does

FlowForge lets you wire together AI pipeline steps visually. Drag nodes onto a ReactFlow canvas, connect them into a graph, and hit Run. The backend validates the DAG (detecting cycles before execution starts), then streams live status updates back as each node executes — yellow for running, green for success, red for error.

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, ReactFlow, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python, SQLModel, SQLite
- **AI**: Groq SDK (llama-3.1-8b-instant)
- **Streaming**: Server-Sent Events (SSE)
- **Infrastructure**: Docker Compose

## Key Technical Features

- **Topological sort (Kahn's algorithm)** — validates DAG structure and detects circular dependencies before any node runs
- **SSE-driven live execution** — FastAPI streams `node_start`, `node_done`, `node_error` events; frontend animates node state in real time with per-node timing
- **6 specialized node executors** — Trigger, Filter, LLM (Groq), HTTP Request (async httpx), Data Transform (Jinja2 templates), Webhook output
- **Template substitution** — `{{field}}` syntax in prompts and URLs resolved at runtime from upstream node output
- **Persistent pipelines** — saved to SQLite, reloadable across sessions

## Running locally

```bash
docker compose up --build
```

Frontend: http://localhost:3000  
Backend: http://localhost:8000
