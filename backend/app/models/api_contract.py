from pydantic import BaseModel, Field
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
    limit: int = Field(default=4, ge=1, le=20)


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


# ---------------------------------------------------------------------------
# POST /outfits/generate  — AI outfit generation
# ---------------------------------------------------------------------------
class WeatherInput(BaseModel):
    temperature: Optional[float] = None
    condition: Optional[str] = None


class OutfitGenerationRequest(BaseModel):
    occasion: Optional[str] = None
    style: Optional[str] = None
    weather: Optional[WeatherInput] = None
    excluded_item_ids: list[str] = Field(default_factory=list)


class OutfitItemResponse(BaseModel):
    id: str
    category: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None
    attributes: dict = Field(default_factory=dict)
    thumbnail_url: Optional[str] = None
    image_url: Optional[str] = None


class ScoreBreakdownItem(BaseModel):
    dimension: str
    score: float
    weight: float
    weighted_score: float


class ScoreResponse(BaseModel):
    overall: float
    breakdown: list[ScoreBreakdownItem] = Field(default_factory=list)


class StylistResponse(BaseModel):
    reason: str
    tips: list[str] = Field(default_factory=list)
    confidence: float = 0.0


class MetadataResponse(BaseModel):
    generated_at: str
    request_id: Optional[str] = None
    used_gemini: bool = False
    fallback_used: bool = False
    generation_time_ms: float = 0.0
    wardrobe_items_count: int = 0
    candidates_generated: int = 0
    slots_missing: list[str] = Field(default_factory=list)


class OutfitGenerationResponse(BaseModel):
    success: bool
    outfit: dict = Field(default_factory=dict)
    score: ScoreResponse
    stylist: StylistResponse
    metadata: MetadataResponse


class RegenerateRequest(BaseModel):
    request_id: Optional[str] = None
    previous_outfit_id: Optional[str] = None
    occasion: Optional[str] = None
    style: Optional[str] = None
    weather: Optional[WeatherInput] = None


class WearOutfitRequest(BaseModel):
    outfit_id: str
    date: Optional[str] = None
    worn_date: Optional[str] = None


class OutfitHistoryItem(BaseModel):
    id: str
    occasion: Optional[str] = None
    style: Optional[str] = None
    weather: Optional[dict] = None
    overall_score: Optional[float] = None
    gemini_used: bool = False
    fallback_used: bool = False
    created_at: str
    items: list[OutfitItemResponse] = Field(default_factory=list)


class OutfitHistoryResponse(BaseModel):
    outfits: list[OutfitHistoryItem] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
