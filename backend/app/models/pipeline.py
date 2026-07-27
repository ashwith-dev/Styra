from pydantic import BaseModel
from typing import Optional


class StageMetrics(BaseModel):
    stage: str  # "validation" | "segmentation" | "storage" | "extraction"
    status: str  # "success" | "failed" | "skipped"
    duration_ms: float
    error: Optional[str] = None
