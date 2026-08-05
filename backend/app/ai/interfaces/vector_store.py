"""Vector store interface for the AI outfit engine.

Abstracts vector database operations — insert, update, delete, and
similarity search — behind an implementation-agnostic contract.
"""

from abc import ABC, abstractmethod
from typing import Optional

from app.ai.models.candidate import CandidateItem


class VectorStore(ABC):
    """Persistent storage and retrieval of vector-indexed clothing items."""

    @abstractmethod
    def insert(self, item_id: str, embedding: list[float], metadata: dict) -> None:
        """Insert a single vector with associated metadata.

        Args:
            item_id: Unique identifier for the clothing item.
            embedding: Dense vector representation.
            metadata: Arbitrary key-value metadata to store alongside
                      the vector (e.g., attributes, image URLs).

        Raises:
            app.ai.utils.exceptions.VectorInsertError: If insertion fails.
        """
        ...

    @abstractmethod
    def update(self, item_id: str, embedding: list[float], metadata: Optional[dict] = None) -> None:
        """Update an existing vector and optionally its metadata.

        Args:
            item_id: Unique identifier for the clothing item.
            embedding: Updated dense vector representation.
            metadata: Optional new metadata dict; if omitted, existing
                      metadata is preserved.

        Raises:
            app.ai.utils.exceptions.VectorUpdateError: If the item does not
                exist or the update fails.
        """
        ...

    @abstractmethod
    def delete(self, item_id: str) -> None:
        """Remove a vector and its metadata from the store.

        Args:
            item_id: Unique identifier for the clothing item to remove.

        Raises:
            app.ai.utils.exceptions.VectorDeleteError: If deletion fails.
        """
        ...

    @abstractmethod
    def search(
        self,
        query_embedding: list[float],
        top_k: int = 20,
        filters: Optional[dict] = None,
    ) -> list[CandidateItem]:
        """Find the top-k most similar items to the query embedding.

        Args:
            query_embedding: Embedding vector to search against.
            top_k: Maximum number of results to return.
            filters: Optional metadata filters to narrow the result set
                     (e.g., ``{"category": "top"}``).

        Returns:
            A list of ``CandidateItem`` instances sorted by similarity
            (highest first).

        Raises:
            app.ai.utils.exceptions.VectorSearchError: If the search fails.
        """
        ...
