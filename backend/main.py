import json
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from dotenv import load_dotenv

from db import create_db, get_session
from models import Pipeline, PipelineRun
from pipeline_runner import run_pipeline

load_dotenv()


EXAMPLE_PIPELINES = [
    {
        "name": "Weather to Summary",
        "nodes": [
            {
                "id": "trigger-1",
                "type": "trigger",
                "position": {"x": 80, "y": 200},
                "data": {
                    "label": "Trigger",
                    "nodeType": "trigger",
                    "config": {"payload": "{}"},
                },
            },
            {
                "id": "http-1",
                "type": "httpRequest",
                "position": {"x": 320, "y": 200},
                "data": {
                    "label": "Fetch Weather (NYC)",
                    "nodeType": "httpRequest",
                    "config": {
                        "method": "GET",
                        "url": "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true",
                        "headers": "{}",
                        "body": "",
                    },
                },
            },
            {
                "id": "llm-1",
                "type": "llm",
                "position": {"x": 580, "y": 200},
                "data": {
                    "label": "Summarize Weather",
                    "nodeType": "llm",
                    "config": {
                        "system_prompt": "You are a friendly weather reporter. Given raw weather API data, write a concise, plain-English summary of the current conditions in 2-3 sentences.",
                        "user_prompt": "{{input}}",
                    },
                },
            },
            {
                "id": "webhook-1",
                "type": "webhook",
                "position": {"x": 840, "y": 200},
                "data": {
                    "label": "Webhook Output",
                    "nodeType": "webhook",
                    "config": {"url": ""},
                },
            },
        ],
        "edges": [
            {"id": "e-trigger-http", "source": "trigger-1", "target": "http-1"},
            {"id": "e-http-llm", "source": "http-1", "target": "llm-1"},
            {"id": "e-llm-webhook", "source": "llm-1", "target": "webhook-1"},
        ],
    },
    {
        "name": "Text Sentiment",
        "nodes": [
            {
                "id": "trigger-2",
                "type": "trigger",
                "position": {"x": 80, "y": 200},
                "data": {
                    "label": "Sample Text Input",
                    "nodeType": "trigger",
                    "config": {
                        "payload": '{"text": "I absolutely love this product! It exceeded all my expectations and the customer support was outstanding."}'
                    },
                },
            },
            {
                "id": "llm-2",
                "type": "llm",
                "position": {"x": 340, "y": 200},
                "data": {
                    "label": "Analyze Sentiment",
                    "nodeType": "llm",
                    "config": {
                        "system_prompt": 'You are a sentiment analysis engine. Analyze the sentiment of the provided text and respond with a JSON object containing: "sentiment" (positive/negative/neutral), "score" (0.0-1.0 confidence), and "reasoning" (one sentence explanation). Respond with only the JSON object, no markdown.',
                        "user_prompt": "Analyze the sentiment of this text: {{text}}",
                    },
                },
            },
            {
                "id": "transform-2",
                "type": "transform",
                "position": {"x": 600, "y": 200},
                "data": {
                    "label": "Format as Report",
                    "nodeType": "transform",
                    "config": {
                        "template": '{"report": {"input_text": "{{text}}", "analysis": "{{response}}", "processed_at": "pipeline_run"}}'
                    },
                },
            },
        ],
        "edges": [
            {"id": "e-trigger-llm", "source": "trigger-2", "target": "llm-2"},
            {"id": "e-llm-transform", "source": "llm-2", "target": "transform-2"},
        ],
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    _seed_example_pipelines()
    yield


def _seed_example_pipelines():
    from sqlmodel import Session as _Session
    from db import engine as _engine

    with _Session(_engine) as session:
        existing = session.exec(select(Pipeline)).first()
        if existing:
            return
        for spec in EXAMPLE_PIPELINES:
            pipeline = Pipeline(
                name=spec["name"],
                nodes=json.dumps(spec["nodes"]),
                edges=json.dumps(spec["edges"]),
            )
            session.add(pipeline)
        session.commit()


app = FastAPI(title="FlowForge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineCreate(BaseModel):
    name: str
    nodes: list = []
    edges: list = []


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    nodes: Optional[list] = None
    edges: Optional[list] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/pipelines")
def create_pipeline(body: PipelineCreate, session: Session = Depends(get_session)):
    pipeline = Pipeline(
        name=body.name,
        nodes=json.dumps(body.nodes),
        edges=json.dumps(body.edges),
    )
    session.add(pipeline)
    session.commit()
    session.refresh(pipeline)
    return pipeline


@app.get("/pipelines")
def list_pipelines(session: Session = Depends(get_session)):
    pipelines = session.exec(select(Pipeline)).all()
    return [
        {"id": p.id, "name": p.name, "created_at": p.created_at}
        for p in pipelines
    ]


@app.get("/pipelines/{pipeline_id}")
def get_pipeline(pipeline_id: int, session: Session = Depends(get_session)):
    pipeline = session.get(Pipeline, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return {
        "id": pipeline.id,
        "name": pipeline.name,
        "nodes": json.loads(pipeline.nodes),
        "edges": json.loads(pipeline.edges),
        "created_at": pipeline.created_at,
        "updated_at": pipeline.updated_at,
    }


@app.put("/pipelines/{pipeline_id}")
def update_pipeline(
    pipeline_id: int, body: PipelineUpdate, session: Session = Depends(get_session)
):
    pipeline = session.get(Pipeline, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    if body.name is not None:
        pipeline.name = body.name
    if body.nodes is not None:
        pipeline.nodes = json.dumps(body.nodes)
    if body.edges is not None:
        pipeline.edges = json.dumps(body.edges)
    pipeline.updated_at = datetime.utcnow()
    session.add(pipeline)
    session.commit()
    session.refresh(pipeline)
    return {"id": pipeline.id, "name": pipeline.name, "updated_at": pipeline.updated_at}


@app.delete("/pipelines/{pipeline_id}")
def delete_pipeline(pipeline_id: int, session: Session = Depends(get_session)):
    pipeline = session.get(Pipeline, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    session.delete(pipeline)
    session.commit()
    return {"deleted": True}


@app.post("/pipelines/{pipeline_id}/run")
def run_pipeline_endpoint(pipeline_id: int, session: Session = Depends(get_session)):
    pipeline = session.get(Pipeline, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    nodes = json.loads(pipeline.nodes)
    edges = json.loads(pipeline.edges)

    run = PipelineRun(pipeline_id=pipeline_id)
    session.add(run)
    session.commit()

    async def event_stream():
        async for event in run_pipeline(nodes, edges):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
