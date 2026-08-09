"""AI module custom exceptions.

Extends the base ``AppError`` hierarchy from ``app.errors`` with
AI-pipeline-specific error types for the outfit engine.
"""

from app.errors import AppError
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_500_INTERNAL_SERVER_ERROR


class AIEngineError(AppError):
    """Base exception for all AI outfit engine errors."""

    def __init__(self, detail: str) -> None:
        super().__init__(HTTP_500_INTERNAL_SERVER_ERROR, detail)


class EmbeddingGenerationError(AIEngineError):
    """Raised when text-to-embedding generation fails."""

    def __init__(self, detail: str = "Embedding generation failed") -> None:
        super().__init__(detail)


class VectorStoreError(AIEngineError):
    """Base exception for vector store operations."""

    def __init__(self, detail: str = "Vector store operation failed") -> None:
        super().__init__(detail)


class VectorInsertError(VectorStoreError):
    """Raised when a vector insert operation fails."""

    def __init__(self, detail: str = "Failed to insert vector") -> None:
        super().__init__(detail)


class VectorUpdateError(VectorStoreError):
    """Raised when a vector update operation fails."""

    def __init__(self, detail: str = "Failed to update vector") -> None:
        super().__init__(detail)


class VectorDeleteError(VectorStoreError):
    """Raised when a vector delete operation fails."""

    def __init__(self, detail: str = "Failed to delete vector") -> None:
        super().__init__(detail)


class VectorSearchError(VectorStoreError):
    """Raised when a vector similarity search fails."""

    def __init__(self, detail: str = "Vector search failed") -> None:
        super().__init__(detail)


class LLMProviderError(AIEngineError):
    """Raised when an LLM provider call fails."""

    def __init__(self, detail: str = "LLM provider call failed") -> None:
        super().__init__(detail)


class OutfitGenerationError(AIEngineError):
    """Raised when outfit generation fails at any pipeline stage."""

    def __init__(self, detail: str = "Outfit generation failed") -> None:
        super().__init__(detail)


class AIValidationError(AIEngineError):
    """Raised when validation of AI engine inputs fails."""

    def __init__(self, detail: str = "AI engine validation failed") -> None:
        # AIEngineError hardcodes 500 — call AppError directly for the 422.
        AppError.__init__(self, HTTP_422_UNPROCESSABLE_ENTITY, detail)
