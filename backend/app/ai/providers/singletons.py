"""Embedding service singletons.

Lazy-loaded BGE-M3 provider with graceful fallback to the deterministic
hash-based embedder. Follows the project's pattern of module-level
singletons with getter functions.

Thread-safety: the global _bge_provider is only set once; the
double-checked locking pattern ensures the model is never loaded
twice even under concurrent access.
"""

import logging
import threading
from typing import Optional

from app.services.embedding.attribute_embedder import AttributeEmbedder
from app.ai.utils.text_builder import build_semantic_text
from app.ai.utils.exceptions import EmbeddingGenerationError
from app.ai.utils.pgvector_format import to_pgvector

logger = logging.getLogger(__name__)

_bge_provider: Optional[object] = None
_bge_lock = threading.Lock()
_attribute_embedder: Optional[AttributeEmbedder] = None


def _get_bge_provider():
    global _bge_provider
    if _bge_provider is not None:
        return _bge_provider
    with _bge_lock:
        if _bge_provider is not None:
            return _bge_provider
        try:
            from app.ai.providers.bge_provider import BGEProvider

            _bge_provider = BGEProvider()
            logger.info("BGE-M3 embedding provider initialised")
        except Exception as exc:
            logger.warning("BGE-M3 provider not available, falling back to deterministic embedder: %s", exc)
            _bge_provider = None
        return _bge_provider


def _get_attribute_embedder() -> AttributeEmbedder:
    global _attribute_embedder
    if _attribute_embedder is None:
        _attribute_embedder = AttributeEmbedder()
    return _attribute_embedder


def generate_embedding(attributes: dict) -> Optional[list[float]]:
    """Generate an embedding for a clothing item.

    Uses BGE-M3 when available, falling back to the deterministic
    hash-based embedder. Returns ``None`` if neither can produce
    a valid embedding.

    Args:
        attributes: The clothing item's attributes dict.

    Returns:
        A normalized embedding vector, or ``None``.
    """
    text = build_semantic_text(attributes)
    if not text:
        logger.warning("Empty semantic text for attributes; falling back to hash embedder")
        return _get_attribute_embedder().embed_attributes(attributes)

    provider = _get_bge_provider()
    if provider is not None:
        try:
            return provider.generate_embedding(text)
        except EmbeddingGenerationError:
            logger.warning("BGE-M3 embedding failed; falling back to hash embedder")

    return _get_attribute_embedder().embed_attributes(attributes)


def generate_embedding_pgvector(attributes: dict) -> Optional[str]:
    """Generate an embedding and return it as a pgvector literal string.

    Args:
        attributes: The clothing item's attributes dict.

    Returns:
        A pgvector-formatted string like ``[0.1,0.2,...]``, or ``None``.
    """
    embedding = generate_embedding(attributes)
    if embedding is None:
        return None
    return to_pgvector(embedding)
