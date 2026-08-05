"""Outfit engine interface — the top-level orchestrator.

Defines the contract for the AI outfit generation pipeline. Implementations
coordinate embedding generation, candidate retrieval, LLM-powered selection,
and explanation to produce complete outfit recommendations.
"""

from abc import ABC, abstractmethod

from app.ai.models.outfit_request import OutfitRequest
from app.ai.models.outfit_response import OutfitResponse


class OutfitEngine(ABC):
    """Generate outfit recommendations from a user's wardrobe."""

    @abstractmethod
    def generate(self, request: OutfitRequest) -> OutfitResponse:
        """Produce outfit recommendations for the given request.

        Args:
            request: Outfit generation request containing user context,
                     wardrobe items, and any filtering constraints.

        Returns:
            A structured response with scored, explained outfit recommendations.

        Raises:
            app.ai.utils.exceptions.OutfitGenerationError: If generation fails
                at any stage (embedding, retrieval, LLM invocation).
        """
        ...

    @property
    @abstractmethod
    def engine_version(self) -> str:
        """Version string of the current engine configuration."""
        ...
