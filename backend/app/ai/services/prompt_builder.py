"""Prompt builder — constructs structured prompts for the LLM.

Service for assembling system and user prompts from wardrobe data, user
context, and outfit constraints. Keeps prompt logic separate from LLM
provider implementations.
"""

from abc import ABC, abstractmethod

from app.ai.models.outfit_request import OutfitRequest
from app.ai.models.candidate import CandidateItem


class PromptBuilder(ABC):
    """Builds structured prompts for the LLM outfit selector.

    Abstract contract — concrete implementations fail at instantiation if
    a method is missing, rather than at request time.
    """

    @abstractmethod
    def build_system_prompt(self) -> str:
        """Construct the system-level instruction prompt.

        Returns:
            System prompt string defining the LLM's role, output format,
            and scoring criteria.
        """
        ...

    @abstractmethod
    def build_user_prompt(self, request: OutfitRequest, candidates: list[CandidateItem]) -> str:
        """Construct the user-specific prompt with wardrobe and context.

        Args:
            request: The outfit generation request with user preferences.
            candidates: Pre-retrieved candidate items for the LLM to select from.

        Returns:
            User prompt string containing wardrobe data, preferences,
            and output formatting instructions.
        """
        ...
