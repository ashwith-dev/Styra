"""Vector service — semantic search and index management.

Wraps a ``VectorStore`` with business-level convenience methods for
searching and managing the vector index.
"""

import logging
from typing import Optional

from app.ai.interfaces.vector_store import VectorStore
from app.ai.models.candidate import CandidateItem
from app.ai.utils.exceptions import VectorSearchError

logger = logging.getLogger(__name__)


class VectorService:
    """High-level vector operations on top of a ``VectorStore``."""

    def __init__(self, store: VectorStore) -> None:
        """Initialise with a concrete vector store backend.

        Args:
            store: Implementation of ``VectorStore``.
        """
        self._store = store

    def index_item(self, item_id: str, embedding: list[float], metadata: Optional[dict] = None) -> None:
        """Index a single clothing item in the vector store.

        Args:
            item_id: Unique item identifier.
            embedding: Dense vector representation.
            metadata: Optional associated item metadata.

        Raises:
            app.ai.utils.exceptions.VectorInsertError: On failure.
        """
        self._store.insert(item_id, embedding, metadata or {})

    def remove_item(self, item_id: str) -> None:
        """Remove a clothing item from the vector index.

        Args:
            item_id: Unique item identifier.

        Raises:
            app.ai.utils.exceptions.VectorDeleteError: On failure.
        """
        self._store.delete(item_id)

    def search_similar(
        self,
        query_embedding: list[float],
        top_k: int = 20,
        filters: Optional[dict] = None,
    ) -> list[CandidateItem]:
        """Find items most similar to the query embedding.

        Args:
            query_embedding: Query vector.
            top_k: Maximum results to return.
            filters: Optional metadata filters (e.g. ``{"category": "top"}``).

        Returns:
            List of ``CandidateItem`` instances sorted by similarity
            (highest first).

        Raises:
            VectorSearchError: If the search fails.
        """
        return self._store.search(query_embedding, top_k=top_k, filters=filters)
