"""LLM provider interface for AI-driven outfit generation.

Defines the contract for language-model backends that select, rank, and
explain outfit combinations from candidate pools.
"""

from abc import ABC, abstractmethod

from app.ai.models.outfit_request import OutfitRequest
from app.ai.models.outfit_response import OutfitResponse


class LLMProvider(ABC):
    """Language model for outfit selection and explanation."""

    @abstractmethod
    def generate_outfits(self, request: OutfitRequest) -> OutfitResponse:
        """Produce ranked outfit recommendations from candidate items.

        Args:
            request: Fully populated outfit request containing user context,
                     wardrobe candidates, and filtering preferences.

        Returns:
            A structured response with scored outfit recommendations and
            natural-language explanations.

        Raises:
            app.ai.utils.exceptions.LLMProviderError: If the LLM call fails.
            app.ai.utils.exceptions.OutfitGenerationError: If the response
                cannot be parsed into a valid ``OutfitResponse``.
        """
        ...

    @abstractmethod
    def explain_outfit(self, outfit_id: str, context: dict) -> str:
        """Generate a natural-language explanation for a specific outfit.

        Args:
            outfit_id: Identifier of the outfit to explain.
            context: Additional context including wardrobe items, user
                     preferences, and environmental factors.

        Returns:
            A human-readable explanation string.

        Raises:
            app.ai.utils.exceptions.LLMProviderError: If the LLM call fails.
        """
        ...
