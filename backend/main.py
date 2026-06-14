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


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    yield


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
