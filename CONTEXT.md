# FlowForge — Project Context

## What It Is

Visual AI pipeline builder built for a resume portfolio project.

**Resume bullet:** "Built visual AI pipeline builder with ReactFlow, Groq LLM integration, and node-by-node SSE execution streaming, enabling real-time workflow orchestration with drag-and-drop canvas."

Users drag nodes onto a ReactFlow canvas, connect them, configure each node with a right-panel form, save the pipeline to SQLite, and click Run to execute the pipeline node-by-node. Live status updates stream back via SSE — nodes pulse yellow while running, turn green on success, red on error.

---

## Architecture

```
Browser (ReactFlow canvas)
  └── Next.js App Router (port 3000)
        ├── /app/api/pipelines/** → proxy routes to FastAPI
        └── SSE: passes upstream.body through verbatim
                    │
              FastAPI (port 8000)
                    ├── /pipelines CRUD → SQLite via SQLModel
                    └── /pipelines/{id}/run
                              │
                        Topological sort (Kahn's algorithm)
                              │
                    Execute nodes in order:
                      - trigger → inject payload
                      - filter  → eval Python expression
                      - llm     → Groq API (llama-3.1-8b-instant)
                      - httpRequest → httpx outbound
                      - transform  → Jinja2-style template render
                      - webhook    → httpx POST result
                              │
                    Stream SSE events: node_start, node_done, node_error, done
```

---

## File Map

### Root
- `README.md` — user-facing quickstart and demo script
- `CONTEXT.md` — this file
- `docker-compose.yml` — orchestrates backend + frontend containers
- `.env.example` (to create) — `GROQ_API_KEY=...`

### Backend (`backend/`)
- `main.py` — FastAPI app, CORS, all route handlers
- `models.py` — SQLModel models: Pipeline (stores nodes/edges as JSON)
- `db.py` — SQLite engine + session factory, `check_same_thread=False`
- `pipeline_runner.py` — Kahn's topological sort, async SSE generator, cycle detection
- `requirements.txt` — fastapi, uvicorn, sqlmodel, groq, httpx, python-dotenv
- `Dockerfile` — python:3.12-slim, installs deps, exposes 8000
- `executors/__init__.py` — executor registry dict
- `executors/trigger.py` — returns payload JSON as first node output
- `executors/llm.py` — calls Groq API with system+user prompt, template substitution
- `executors/filter.py` — eval()s Python boolean expression against input data
- `executors/http_request.py` — httpx async GET/POST/PUT/DELETE with template URLs/body
- `executors/transform.py` — template-based JSON reshaping with `{{field}}` syntax
- `executors/webhook.py` — POST pipeline output to configured URL

### Frontend (`frontend/`)
- `app/page.tsx` — main canvas page: ReactFlow, drag-drop, SSE consumer, save/load/run
- `app/layout.tsx` — dark theme, Inter font, Toaster
- `app/globals.css` — Tailwind + shadcn vars + ReactFlow dark overrides
- `app/api/pipelines/route.ts` — GET/POST proxy to backend
- `app/api/pipelines/[id]/route.ts` — GET/PUT/DELETE proxy
- `app/api/pipelines/[id]/run/route.ts` — POST, proxies SSE stream verbatim
- `lib/types.ts` — TypeScript types: PipelineNodeData, Pipeline, NodeExecution, SSEEvent
- `lib/api.ts` — fetch helpers + `runPipeline()` async generator (SSE parser)
- `lib/nodeTypes.ts` — maps node type strings to React components for ReactFlow
- `lib/utils.ts` — shadcn cn() utility
- `components/Palette.tsx` — left sidebar with draggable node cards
- `components/PipelineToolbar.tsx` — top bar: pipeline name, Load dropdown, Save, Run
- `components/ExecutionLog.tsx` — collapsible bottom drawer with per-node status/output
- `components/nodes/BaseNode.tsx` — shared node shell with status border colors + Handle
- `components/nodes/TriggerNode.tsx` — shows payload set/not set
- `components/nodes/LLMNode.tsx` — shows model name + truncated system prompt
- `components/nodes/FilterNode.tsx` — shows expression
- `components/nodes/HttpRequestNode.tsx` — shows METHOD + truncated URL
- `components/nodes/DataTransformNode.tsx` — shows template configured/not
- `components/nodes/WebhookNode.tsx` — shows truncated URL
- `components/config/NodeConfigPanel.tsx` — right sidebar, routes to config component
- `components/config/TriggerConfig.tsx` — JSON textarea with validation
- `components/config/LLMConfig.tsx` — system + user prompt textareas
- `components/config/FilterConfig.tsx` — Python expression input
- `components/config/HttpRequestConfig.tsx` — method select + URL + headers + body
- `components/config/WebhookConfig.tsx` — URL input
- `components/config/DataTransformConfig.tsx` — template textarea
- `components/ui/*` — shadcn/ui components (base-ui v1.5 based, NOT Radix)
- `next.config.ts` — `output: "standalone"` for Docker
- `Dockerfile` — multi-stage: deps → builder → runner (node:20-alpine)

---

## Key Implementation Patterns

### 1. Topological Sort
`backend/pipeline_runner.py` uses Kahn's algorithm: builds in-degree map from edges, enqueues all zero-in-degree nodes, processes in BFS order. Detects cycles by checking if processed count equals total node count. Each node's output becomes the input for its downstream neighbors.

### 2. SSE Streaming
FastAPI: `async def` generator yields `data: {json}\n\n` strings wrapped in `StreamingResponse(media_type="text/event-stream")`.

Next.js proxy at `app/api/pipelines/[id]/run/route.ts` does:
```ts
return new Response(upstream.body, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
});
```
This passes the ReadableStream through verbatim — no buffering.

Client `lib/api.ts` `runPipeline()` reads with `getReader()`, splits on `\n\n`, parses `data: ` lines, and yields typed `SSEEvent` objects via async generator.

### 3. ReactFlow Drop Coordinates
`onDrop` in `app/page.tsx`:
```ts
const bounds = reactFlowWrapper.current.getBoundingClientRect();
const position = rfInstance.current.screenToFlowPosition({
  x: e.clientX - bounds.left,
  y: e.clientY - bounds.top,
});
```
`screenToFlowPosition()` converts viewport pixels to flow canvas coordinates accounting for pan/zoom.

### 4. Node Status Colors (Live Updates)
`nodesWithExecution` computed on every render:
```ts
const nodesWithExecution = nodes.map((n) => ({
  ...n,
  data: { ...n.data, execution: executions.get(n.id) },
}));
```
`BaseNode.tsx` reads `data.execution?.status` and applies CSS class from `STATUS_COLORS` map. ReactFlow re-renders nodes automatically when props change.

### 5. PipelineNodeData extends Record<string, unknown>
Required for `@xyflow/react` v12 compatibility. ReactFlow's internal types constrain node data to `Record<string, unknown>`. Without this extension, TypeScript errors occur when passing custom node data to `useNodesState` and `NodeProps`.

### 6. NodeProps Generic (v12 breaking change)
In `@xyflow/react` v12, `NodeProps<T>` takes the full `Node<T>` type, not just the data type:
```ts
// Correct for v12:
function TriggerNode(props: NodeProps<Node<PipelineNodeData>>) { ... }
// Wrong (would work in v11):
function TriggerNode(props: NodeProps<PipelineNodeData>) { ... }
```

### 7. shadcn Uses base-ui Not Radix
This project's shadcn init installed `@base-ui/react` v1.5 components (not `@radix-ui`). Key differences:
- `DropdownMenuTrigger` does NOT accept `asChild` — put content directly inside trigger
- `Select` has generic `Value` type; use native `<select>` for string-only HTTP method selection
- `DropdownMenuContent` positioning uses `Positioner.Props` pattern

---

## Gotchas

1. **sqlmodel>=0.0.21** required for Pydantic v2 compatibility — older versions raise field validation errors
2. **SQLite check_same_thread=False** — FastAPI runs async, SQLite needs this for multi-thread safety
3. **ReactFlow NodeData must extend Record<string, unknown>** — TypeScript constraint from `@xyflow/react`
4. **SSE proxy pattern** — Don't try to parse/transform SSE in Next.js middleware; pass `upstream.body` directly
5. **base-ui Select vs Radix Select** — shadcn 2025 uses base-ui; APIs differ significantly from Radix
6. **rfInstance typed as `any`** — ReactFlow's `ReactFlowInstance` generic clashes with `nodesWithExecution` inferred type (optional `execution` field vs `undefined`)

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | backend `.env` | Groq API key for LLM node |
| `DATABASE_URL` | backend `.env` | SQLite path, e.g. `sqlite:///./flowforge.db` |
| `BACKEND_URL` | frontend `.env.local` | Backend base URL, default `http://localhost:8000` |

---

## How to Run

### Manual (development)

```bash
# Backend
cd backend
pip install -r requirements.txt
echo "GROQ_API_KEY=your-key" > .env
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

### Docker

```bash
cp .env.example .env
# Edit .env and add GROQ_API_KEY
docker compose up --build
# open http://localhost:3000
```

---

## Git History

```
16d929b feat(flowforge): complete frontend + Docker — ReactFlow canvas, 6 node types, SSE execution, config panels
a40955a feat(flowforge): backend scaffold — FastAPI, 6 executors, topological pipeline runner, SSE streaming, full CRUD
```

---

## Demo Script (2 minutes)

1. Open http://localhost:3000
2. Drag **Trigger** onto canvas → click it → set payload: `{"name": "FlowForge", "score": 0.9}`
3. Drag **Filter** → click → set expression: `data['score'] > 0.5`
4. Drag **LLM Transform** → click → set user prompt: `Write a welcome message for {{name}}`
5. Drag **Webhook Output** → click → paste a URL from webhook.site
6. Connect: Trigger → Filter → LLM → Webhook (drag from right handle to left handle)
7. Click **Save** in toolbar
8. Click **Run** — watch nodes pulse yellow → turn green
9. Click **Execution Log** bar at bottom → see LLM output with timing
10. Check webhook.site — AI-generated welcome message arrived as POST body
