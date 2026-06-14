from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Pipeline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    nodes: str = Field(default="[]")   # JSON string
    edges: str = Field(default="[]")   # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PipelineRun(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pipeline_id: int = Field(foreign_key="pipeline.id")
    status: str = Field(default="running")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
