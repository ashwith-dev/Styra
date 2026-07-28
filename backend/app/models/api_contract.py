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
    total_count: int = 0


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
# POST /recommendations  (existing — item-based similarity via pgvector)
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


# ---------------------------------------------------------------------------
# GET /recommendations  (new — outfit-based AI stylist engine)
# ---------------------------------------------------------------------------
class OutfitItem(BaseModel):
    id: str
    attributes: dict
    thumbnail_url: Optional[str] = None


class OutfitRecommendationItem(BaseModel):
    outfit_id: str
    outfit_items: list[OutfitItem]
    score: float
    explanation: str
    outfit_category: str


class OutfitRecommendationResponse(BaseModel):
    recommendations: list[OutfitRecommendationItem]


# ---------------------------------------------------------------------------
# POST /recommendations/feedback  — like/dislike an outfit
# ---------------------------------------------------------------------------
class OutfitFeedbackRequest(BaseModel):
    outfit_id: str
    feedback: str  # "like" or "dislike"


class OutfitFeedbackResponse(BaseModel):
    feedback: str


# ---------------------------------------------------------------------------
# POST /recommendations/favorites  — save an outfit as favourite
# ---------------------------------------------------------------------------
class OutfitFavoriteRequest(BaseModel):
    outfit_id: str
    outfit_data: OutfitRecommendationItem


class OutfitFavoriteResponse(BaseModel):
    id: str
    outfit_id: str
    created_at: str
