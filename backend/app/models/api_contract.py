from pydantic import BaseModel
from typing import Optional

from app.services.extraction.base_attributes import AIPipelineResult


# ---------------------------------------------------------------------------
# POST /analyze-clothing
# ---------------------------------------------------------------------------
class AnalyzeClothingResponse(BaseModel):
    pipeline_token: str
    result: AIPipelineResult
    segmented_image_url: str
    thumbnail_url: Optional[str] = None
    metrics: list[dict]


# ---------------------------------------------------------------------------
# POST /clothing  — save user-confirmed item
# ---------------------------------------------------------------------------
class SaveClothingRequest(BaseModel):
    pipeline_token: str
    attributes: dict


class SaveClothingResponse(BaseModel):
    id: str
    original_image_url: str
    segmented_image_url: str
    thumbnail_url: Optional[str] = None
    attributes: dict


# ---------------------------------------------------------------------------
# GET /clothing  — list items
# ---------------------------------------------------------------------------
class ClothingItemBrief(BaseModel):
    id: str
    original_image_url: str
    segmented_image_url: str
    thumbnail_url: Optional[str] = None
    attributes: dict
    status: str
    created_at: str


class ListClothingResponse(BaseModel):
    items: list[ClothingItemBrief]


# ---------------------------------------------------------------------------
# GET /clothing/:id  — item detail
# ---------------------------------------------------------------------------
class ClothingItemDetail(BaseModel):
    id: str
    original_image_url: str
    segmented_image_url: str
    thumbnail_url: Optional[str] = None
    attributes: dict
    raw_pipeline_result: Optional[dict] = None
    pipeline_metrics: Optional[dict] = None
    status: str
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# PATCH /clothing/:id  — edit attributes
# ---------------------------------------------------------------------------
class UpdateClothingRequest(BaseModel):
    attributes: dict


# ---------------------------------------------------------------------------
# POST /recommendations
# ---------------------------------------------------------------------------
class RecommendationRequest(BaseModel):
    clothing_item_id: str
    limit: int = 4


class RecommendationItem(BaseModel):
    id: str
    attributes: dict
    thumbnail_url: Optional[str] = None
    similarity_score: float


class RecommendationResponse(BaseModel):
    source_item_id: str
    recommendations: list[RecommendationItem]
