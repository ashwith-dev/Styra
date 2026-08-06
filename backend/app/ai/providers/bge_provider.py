"""BGE-M3 embedding provider.

Lazy-loads the BGE-M3 model via sentence-transformers and produces
normalized 1024-dimensional dense embeddings. Thread-safe singleton.
"""

import math
import logging
import threading
from typing import Optional

from app.ai.interfaces.embedding_provider import EmbeddingProvider
from app.ai.utils.constants import EMBEDDING_DIMENSIONS
from app.ai.utils.exceptions import EmbeddingGenerationError

logger = logging.getLogger(__name__)

_BGE_MODEL_NAME = "BAAI/bge-m3"
_EMPTY_EMBED_SIZE_ERROR = (
    "model returned empty embedding — input may be empty after tokenization"
)


class BGEProvider(EmbeddingProvider):
    """BGE-M3 dense embedding provider via sentence-transformers.

    The underlying ``SentenceTransformer`` is loaded once at first use
    and shared across all subsequent calls. Thread-safe via a re-entrant
    lock guarding model initialization and inference.
    """

    def __init__(self, model_name: Optional[str] = None) -> None:
        """Initialise with an optional model name override.

        Args:
            model_name: HuggingFace model ID. Defaults to ``BAAI/bge-m3``.
        """
        self._model_name = model_name or _BGE_MODEL_NAME
        self._model: Optional[object] = None
        self._lock = threading.RLock()

    @property
    def embedding_dimensions(self) -> int:
        return EMBEDDING_DIMENSIONS

    def generate_embedding(self, text: str) -> list[float]:
        """Produce a single normalized 1024-dim embedding for *text*.

        Args:
            text: Natural-language text representation of a clothing item.

        Returns:
            L2-normalized dense vector as a list of 1024 floats.

        Raises:
            EmbeddingGenerationError: If the model fails to load or
                produce a valid embedding.
        """
        if not text or not text.strip():
            raise EmbeddingGenerationError("cannot embed empty text")
        return self._encode_single(text)

    def batch_generate(self, texts: list[str]) -> list[list[float]]:
        """Generate normalized embeddings for *texts* in a single batch.

        Args:
            texts: List of text representations to embed.

        Returns:
            List of L2-normalized vectors, same order as input.

        Raises:
            EmbeddingGenerationError: If the model fails or any input
                produces an empty embedding.
        """
        if not texts:
            return []

        non_empty = [t for t in texts if t and t.strip()]
        if not non_empty:
            raise EmbeddingGenerationError("all input texts are empty")

        model = self._get_model()
        try:
            raw = model.encode(non_empty, normalize_embeddings=True, show_progress_bar=False)
        except Exception as exc:
            logger.error("BGE-M3 batch encode failed: %s", exc)
            raise EmbeddingGenerationError(f"batch embedding failed: {exc}") from exc

        if raw is None or raw.size == 0:
            raise EmbeddingGenerationError(_EMPTY_EMBED_SIZE_ERROR)

        result: list[list[float]] = []
        raw_list = raw.tolist()
        idx = 0
        for text in texts:
            if text and text.strip():
                vec = raw_list[idx]
                if not vec or len(vec) != EMBEDDING_DIMENSIONS:
                    raise EmbeddingGenerationError(
                        f"invalid embedding dimensions: {len(vec) if vec else 0}"
                    )
                result.append(normalize_vector(vec))
                idx += 1
            else:
                result.append([0.0] * EMBEDDING_DIMENSIONS)
        return result

    def _encode_single(self, text: str) -> list[float]:
        model = self._get_model()
        try:
            raw = model.encode([text], normalize_embeddings=True, show_progress_bar=False)
        except Exception as exc:
            logger.error("BGE-M3 encode failed: %s", exc)
            raise EmbeddingGenerationError(f"embedding failed: {exc}") from exc

        if raw is None or raw.size == 0:
            raise EmbeddingGenerationError(_EMPTY_EMBED_SIZE_ERROR)

        vec = raw[0].tolist()
        if not vec or len(vec) != EMBEDDING_DIMENSIONS:
            raise EmbeddingGenerationError(
                f"invalid embedding dimensions: {len(vec) if vec else 0}"
            )
        return normalize_vector(vec)

    def _get_model(self) -> object:
        if self._model is not None:
            return self._model
        with self._lock:
            if self._model is not None:
                return self._model
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise EmbeddingGenerationError(
                    "sentence-transformers is not installed; "
                    "install with: pip install sentence-transformers"
                ) from exc

            logger.info("Loading BGE-M3 model: %s", self._model_name)
            try:
                self._model = SentenceTransformer(self._model_name)
            except Exception as exc:
                raise EmbeddingGenerationError(
                    f"failed to load model {self._model_name}: {exc}"
                ) from exc
            logger.info("BGE-M3 model loaded successfully")
            return self._model


def normalize_vector(vec: list[float]) -> list[float]:
    """L2-normalize a vector in-place.

    Returns the original list if already unit-length or zero,
    scaled values otherwise.
    """
    magnitude = math.sqrt(sum(v * v for v in vec))
    if magnitude == 0.0:
        return [0.0] * len(vec)
    if abs(magnitude - 1.0) < 1e-8:
        return vec
    return [v / magnitude for v in vec]
