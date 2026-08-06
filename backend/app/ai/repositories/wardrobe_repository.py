"""Wardrobe repository abstraction.

Provides a clean interface for fetching wardrobe data from the underlying
storage layer (Supabase). Decouples the AI pipeline from direct database
access, enabling testability and backend swaps.
"""

from abc import ABC, abstractmethod

from app.ai.models.candidate import CandidateItem


class WardrobeRepository(ABC):
    """Data access interface for user wardrobe items."""

    @abstractmethod
    def fetch_all_for_user(
        self,
        user_id: str,
        *,
        include_embedding: bool = False,
    ) -> list[CandidateItem]:
        """Retrieve all completed wardrobe items for a user.

        Args:
            user_id: The authenticated user's identifier.
            include_embedding: When False (default) the embedding column
                is not selected — similarity enrichment is off in the
                default pipeline and the vectors are large.

        Returns:
            A list of ``CandidateItem`` instances.

        Raises:
            app.ai.utils.exceptions.AIEngineError: If the fetch fails.
        """
        ...

    @abstractmethod
    def fetch_by_ids(self, item_ids: list[str], user_id: str) -> list[CandidateItem]:
        """Retrieve specific wardrobe items by their identifiers.

        Args:
            item_ids: List of item identifiers to fetch.
            user_id: The authenticated user's identifier (for RLS scoping).

        Returns:
            A list of ``CandidateItem`` instances (may be empty if none found).

        Raises:
            app.ai.utils.exceptions.AIEngineError: If the fetch fails.
        """
        ...

    @abstractmethod
    def count_for_user(self, user_id: str) -> int:
        """Return the count of completed wardrobe items for a user.

        Args:
            user_id: The authenticated user's identifier.

        Returns:
            Total number of items.

        Raises:
            app.ai.utils.exceptions.AIEngineError: If the count fails.
        """
        ...
