"""Embedding service — complete lifecycle for clothing item embeddings.

Wraps an ``EmbeddingProvider`` with full CRUD: generate embeddings from
text representations, and coordinate storage via a ``VectorStore``.
"""

import logging
from typing import Optional

from app.ai.interfaces.embedding_provider import EmbeddingProvider
from app.ai.interfaces.vector_store import VectorStore
from app.ai.utils.exceptions import EmbeddingGenerationError

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Manages the full embedding lifecycle for clothing items.

    Coordinates between the embedding model (text → vector) and the
    vector store (vector → database).
    """

    def __init__(self, provider: EmbeddingProvider, vector_store: VectorStore) -> None:
        """Initialise with concrete backends.

        Args:
            provider: Text-to-embedding backend (e.g., BGE-M3).
            vector_store: Vector storage backend (e.g., pgvector).
        """
        self._provider = provider
        self._vector_store = vector_store

    def create_embedding(self, item_id: str, text: str, metadata: Optional[dict] = None) -> list[float]:
        """Generate and persist an embedding for a clothing item.

        Args:
            item_id: Unique clothing item identifier.
            text: Semantic text representation of the item.
            metadata: Optional metadata to store alongside the vector.

        Returns:
            The generated embedding vector.

        Raises:
            EmbeddingGenerationError: If embedding generation or storage fails.
        """
        embedding = self.embed_text(text)
        self._vector_store.insert(item_id, embedding, metadata or {})
        logger.debug("Created embedding for item %s", item_id)
        return embedding

    def update_embedding(self, item_id: str, text: str, metadata: Optional[dict] = None) -> list[float]:
        """Regenerate and update an existing embedding.

        Args:
            item_id: Unique clothing item identifier.
            text: Updated semantic text representation.
            metadata: Optional metadata to update.

        Returns:
            The newly generated embedding vector.

        Raises:
            EmbeddingGenerationError: If generation or storage fails.
        """
        embedding = self.embed_text(text)
        self._vector_store.update(item_id, embedding, metadata)
        logger.debug("Updated embedding for item %s", item_id)
        return embedding

    def delete_embedding(self, item_id: str) -> None:
        """Remove an embedding from the vector store.

        Args:
            item_id: Unique clothing item identifier.

        Raises:
            EmbeddingGenerationError: If deletion fails.
        """
        self._vector_store.delete(item_id)
        logger.debug("Deleted embedding for item %s", item_id)

    def embed_text(self, text: str) -> list[float]:
        """Generate a single embedding for the given text.

        Args:
            text: Input text to embed.

        Returns:
            Dense vector as a list of floats.

        Raises:
            EmbeddingGenerationError: On failure.
        """
        return self._provider.generate_embedding(text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts.

        Args:
            texts: List of input texts.

        Returns:
            List of embedding vectors, one per input.

        Raises:
            EmbeddingGenerationError: On failure.
        """
        return self._provider.batch_generate(texts)

    @property
    def dimensions(self) -> int:
        """Dimensionality of embeddings produced by this service."""
        return self._provider.embedding_dimensions
