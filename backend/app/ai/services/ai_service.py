"""AI service — top-level orchestrator for the outfit engine.

Wires together embedding, vector search, prompt construction, and LLM
invocation into a single pipeline. This is the primary entry point that
API routes will call.
"""

from app.ai.interfaces.embedding_provider import EmbeddingProvider
from app.ai.interfaces.llm_provider import LLMProvider
from app.ai.interfaces.vector_store import VectorStore
from app.ai.models.outfit_request import OutfitRequest
from app.ai.models.outfit_response import OutfitResponse


class AIService:
    """Orchestrates the AI outfit generation pipeline.

    Coordinates embedding generation, candidate retrieval via vector search,
    prompt construction, LLM-based selection and explanation, and response
    assembly into a structured ``OutfitResponse``.
    """

    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        vector_store: VectorStore,
        llm_provider: LLMProvider,
    ) -> None:
        """Initialise the AI service with its dependencies.

        Args:
            embedding_provider: Text-to-embedding backend.
            vector_store: Vector-indexed item storage and search.
            llm_provider: Language model for outfit selection and explanation.
        """
        self._embedding_provider = embedding_provider
        self._vector_store = vector_store
        self._llm_provider = llm_provider

    def generate_outfits(self, request: OutfitRequest) -> OutfitResponse:
        """Run the full outfit generation pipeline.

        Args:
            request: Outfit generation request with user context and wardrobe.

        Returns:
            A structured response containing ranked outfit recommendations.

        Raises:
            app.ai.utils.exceptions.OutfitGenerationError: If any pipeline
                stage fails.
        """
        raise NotImplementedError
