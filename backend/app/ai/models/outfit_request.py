"""Outfit generation request model.

Represents a complete outfit recommendation request from the client.
"""

from typing import Optional

from pydantic import BaseModel, Field

from app.ai.models.candidate import CandidateItem


class OutfitRequest(BaseModel):
    """Input for the AI outfit engine.

    Encapsulates the user's wardrobe items, contextual preferences,
    and any filtering constraints that guide outfit generation.
    """

    user_id: str
    wardrobe_items: list[CandidateItem] = Field(default_factory=list)
    occasion: Optional[str] = None
    season: Optional[str] = None
    weather: Optional[str] = None
    style_preference: Optional[str] = None
    color_preference: Optional[str] = None
    max_outfits: int = Field(default=5, ge=1, le=20)
    excluded_item_ids: list[str] = Field(default_factory=list)
    additional_context: Optional[str] = None
