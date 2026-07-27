"""Base interface for wardrobe item embedders.

Embeddings power pgvector similarity in ``match_compatible_items``.
Implementations must return a 512-dimensional vector (the schema's
``vector(512)``) or ``None`` when there is nothing meaningful to embed.
"""

from abc import ABC, abstractmethod
from typing import Optional

EMBEDDING_DIM = 512


class BaseEmbedder(ABC):
    @abstractmethod
    def embed_attributes(self, attributes: dict) -> Optional[list[float]]:
        """Return a 512-dim embedding for a clothing item's attributes."""
        ...
