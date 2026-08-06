"""Scored outfit candidate model — extends the base recommendation model.

Includes full score breakdown, matched/rejected rules, and per-dimension
scores for explainability.
"""

from typing import Optional

from pydantic import BaseModel, Field

from app.ai.models.candidate import CandidateItem


class ScoreComponent(BaseModel):
    """A single scoring dimension with raw score and weighted contribution."""

    dimension: str
    raw_score: float = 0.0
    weight: float = 0.0
    weighted_score: float = 0.0


class OutfitCandidate(BaseModel):
    """A single scored outfit candidate with complete score breakdown.

    Includes every item in the outfit, the composite score, per-dimension
    score components, and lists of matched and rejected rules for
    explainability.
    """

    outfit_id: str
    items: list[CandidateItem] = Field(default_factory=list)
    score: float = 0.0
    score_breakdown: list[ScoreComponent] = Field(default_factory=list)
    outfit_category: str = ""
    matched_rules: list[str] = Field(default_factory=list)
    rejected_rules: list[str] = Field(default_factory=list)


class CandidateSet(BaseModel):
    """Complete result from the candidate selection & ranking pipeline.

    Contains the top-N ranked outfit candidates plus pipeline metadata.
    """

    candidates: list[OutfitCandidate] = Field(default_factory=list)
    total_combinations_generated: int = 0
    total_combinations_scored: int = 0
    pipeline_duration_ms: float = 0.0
    # Optional slots the wardrobe couldn't fill after filtering
    # (e.g. ["footwear"] when the user owns no shoes) — surfaced in API
    # metadata so the client can message it.
    slots_missing: list[str] = Field(default_factory=list)
