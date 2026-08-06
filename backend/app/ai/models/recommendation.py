"""Outfit recommendation result model.

Represents a single scored outfit recommendation with associated items,
composite score, and a natural-language explanation.
"""

from pydantic import BaseModel, Field

from app.ai.models.candidate import CandidateItem


class RecommendationReason(BaseModel):
    """A specific, named reason contributing to an outfit's score."""

    name: str
    description: str
    weight: float = 0.0
    score: float = 0.0


class OutfitRecommendation(BaseModel):
    """A single outfit recommendation with constituent items, score, and explanation."""

    outfit_id: str
    items: list[CandidateItem] = Field(default_factory=list)
    score: float = 0.0
    explanation: str = ""
    outfit_category: str = ""
    reasons: list[RecommendationReason] = Field(default_factory=list)
