"""Candidate selector — retrieves wardrobe items and runs the filter pipeline.

Reuses the existing ``FilterEngine`` and ``PGVectorStore`` to retrieve,
filter, partition, and semantically enrich wardrobe candidates. All
internal operations use ``CandidateItem`` models — no raw dicts.
"""

import logging
from typing import Optional

from app.ai.models.candidate import CandidateItem
from app.ai.models.outfit_candidate import OutfitCandidate
from app.ai.engine.filter_engine import FilterEngine, FilterContext, FilterResult

logger = logging.getLogger(__name__)


class CandidateSelector:
    """Fetches wardrobe, filters, partitions, and enriches candidates.

    Wraps the ``FilterEngine`` and optional ``VectorService`` for
    semantic similarity enrichment.
    """

    def __init__(
        self,
        filter_engine: FilterEngine,
        vector_service: object | None = None,
    ) -> None:
        """Initialise with a filter engine and optional vector service.

        Args:
            filter_engine: Configured ``FilterEngine`` instance.
            vector_service: Optional ``VectorService`` for semantic
                           similarity enrichment of candidates.
        """
        self._filter = filter_engine
        self._vector = vector_service

    def select(
        self,
        wardrobe: list[CandidateItem],
        context: FilterContext,
    ) -> FilterResult:
        """Run the filter pipeline on *wardrobe* items.

        Converts ``CandidateItem`` models into dicts for the
        ``FilterEngine`` (which currently operates on raw dicts for
        compatibility with existing engines), runs the pipeline, and
        returns the result.

        Args:
            wardrobe: Full wardrobe as ``CandidateItem`` instances.
            context: Filter parameters.

        Returns:
            ``FilterResult`` with filtered and partitioned items.
        """
        raw = [item.model_dump() for item in wardrobe]
        return self._filter.filter(raw, context)

    def enrich_with_similarity(
        self,
        partitioned: dict[str, list[dict]],
        query_embedding: list[float],
    ) -> dict[str, list[dict]]:
        """Optionally enrich candidates with similarity scores.

        When a ``VectorService`` is available, computes cosine
        similarity between each item's embedding and the query
        embedding, storing the result in each item dict.

        Args:
            partitioned: Category → list of item dicts.
            query_embedding: Query vector for similarity.

        Returns:
            Same structure with similarity scores populated.
        """
        if self._vector is None:
            return partitioned

        for category, items in partitioned.items():
            for item in items:
                emb = item.get("embedding")
                if emb:
                    item["similarity_score"] = self._compute_similarity(
                        query_embedding, emb
                    )
        return partitioned

    @staticmethod
    def _compute_similarity(
        query: list[float],
        item_embedding: list[float],
    ) -> float:
        if not query or not item_embedding or len(query) != len(item_embedding):
            return 0.0
        dot = sum(a * b for a, b in zip(query, item_embedding))
        return max(0.0, min(1.0, dot))
