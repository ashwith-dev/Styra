"""Embedding provider interface for the AI outfit engine.

Generates vector embeddings from text or structured clothing representations.
Distinct from the existing ``BaseEmbedder`` which embeds clothing item attributes
for pgvector similarity — this interface targets LLM-driven text-to-vector use
cases such as prompt embedding and semantic search over outfit descriptions.
"""

from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """Generate vector embeddings from arbitrary input representations."""

    @abstractmethod
    def generate_embedding(self, text: str) -> list[float]:
        """Produce a dense vector embedding for the supplied text.

        Args:
            text: Free-form text (prompt, description, attribute summary)
                  to be embedded.

        Returns:
            A list of floats representing the embedding vector.

        Raises:
            app.ai.utils.exceptions.EmbeddingGenerationError: If embedding
                generation fails for any reason.
        """
        ...

    @abstractmethod
    def batch_generate(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts in a single call.

        Args:
            texts: List of text inputs to embed.

        Returns:
            A list of embedding vectors, one per input text, in the same order.

        Raises:
            app.ai.utils.exceptions.EmbeddingGenerationError: If any embedding
                generation fails.
        """
        ...

    @property
    @abstractmethod
    def embedding_dimensions(self) -> int:
        """Dimensionality of the vectors produced by this provider."""
        ...
