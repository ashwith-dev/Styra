"""Outfit generation response model.

Structured output from the AI outfit engine containing ranked outfit
recommendations with scores and explanations.
"""

from pydantic import BaseModel, Field

from app.ai.models.recommendation import OutfitRecommendation


class OutfitResponse(BaseModel):
    """Output from the AI outfit engine.

    Contains ranked outfit recommendations, each with constituent items,
    a composite score, and a natural-language explanation.
    """

    recommendations: list[OutfitRecommendation] = Field(default_factory=list)
    total_candidates_considered: int = 0
    generation_duration_ms: float = 0.0
    engine_version: str = ""
