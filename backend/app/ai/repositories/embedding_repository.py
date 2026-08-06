"""Embedding repository abstraction.

Provides a persistence interface for storing and retrieving pre-computed
clothing item embeddings. Decouples embedding storage from the vector
search store — the embedding repository handles raw persistence while
the ``VectorStore`` handles similarity search.
"""

from abc import ABC, abstractmethod
from typing import Optional


class EmbeddingRepository(ABC):
    """Persistence layer for pre-computed clothing item embeddings."""

    @abstractmethod
    def save(self, item_id: str, embedding: list[float]) -> None:
        """Persist an embedding for a clothing item.

        Args:
            item_id: Unique clothing item identifier.
            embedding: Dense vector representation.

        Raises:
            app.ai.utils.exceptions.AIEngineError: If persistence fails.
        """
        ...

    @abstractmethod
    def get(self, item_id: str) -> Optional[list[float]]:
        """Retrieve a stored embedding for a clothing item.

        Args:
            item_id: Unique clothing item identifier.

        Returns:
            The embedding vector if found, or ``None``.

        Raises:
            app.ai.utils.exceptions.AIEngineError: If retrieval fails.
        """
        ...

    @abstractmethod
    def delete(self, item_id: str) -> None:
        """Remove a stored embedding.

        Args:
            item_id: Unique clothing item identifier.

        Raises:
            app.ai.utils.exceptions.AIEngineError: If deletion fails.
        """
        ...

    @abstractmethod
    def batch_save(self, items: list[tuple[str, list[float]]]) -> None:
        """Persist multiple embeddings in a single operation.

        Args:
            items: List of ``(item_id, embedding)`` tuples.

        Raises:
            app.ai.utils.exceptions.AIEngineError: If persistence fails.
        """
        ...
