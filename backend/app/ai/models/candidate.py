"""Candidate clothing item model.

Represents a single wardrobe item that is eligible for inclusion in an
outfit. Used as both input to the engine and as items within outfit results.
"""

from typing import Optional

from pydantic import BaseModel, Field


class CandidateItem(BaseModel):
    """A wardrobe item that may be included in an outfit recommendation.

    Contains the item's identity, visual URL, structured attributes, and
    a pre-computed similarity score when retrieved from vector search.
    """

    id: str
    attributes: dict = Field(default_factory=dict)
    thumbnail_url: Optional[str] = None
    original_image_url: Optional[str] = None
    embedding: Optional[list[float]] = None
    similarity_score: float = 0.0
    category: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    style: Optional[str] = None
