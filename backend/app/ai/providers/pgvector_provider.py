"""pgvector-backed vector store implementation.

Manages vector insert, update, delete, and similarity search via
Supabase's pgvector extension and the existing ``match_compatible_items``
RPC function.
"""

import logging
from typing import Any, Optional

from app.ai.interfaces.vector_store import VectorStore
from app.ai.models.candidate import CandidateItem
from app.ai.utils.exceptions import (
    VectorInsertError,
    VectorUpdateError,
    VectorDeleteError,
    VectorSearchError,
)
from app.ai.utils.pgvector_format import to_pgvector, from_pgvector

logger = logging.getLogger(__name__)


class PGVectorStore(VectorStore):
    """Vector store backed by Supabase pgvector.

    Requires a Supabase client instance. All database operations use the
    ``clothing_items`` table. Similarity search delegates to the
    ``match_compatible_items`` RPC.
    """

    def __init__(self, supabase_client: object) -> None:
        """Initialise with a Supabase client.

        Args:
            supabase_client: A Supabase ``Client`` instance (user-scoped
                             or service-role depending on context).
        """
        self._client = supabase_client

    def insert(self, item_id: str, embedding: list[float], metadata: dict) -> None:
        """Store an embedding and metadata for *item_id*.

        Args:
            item_id: Clothing item identifier.
            embedding: 1024-dim dense vector.
            metadata: Associated metadata dict (e.g. attributes, URLs).

        Raises:
            VectorInsertError: If the insert fails.
        """
        pg_vec = to_pgvector(embedding)
        try:
            self._client.table("clothing_items").update({
                "embedding": pg_vec,
            }).eq("id", item_id).execute()
        except Exception as exc:
            logger.error("pgvector insert failed for item %s: %s", item_id, exc)
            raise VectorInsertError(f"failed to insert vector for {item_id}: {exc}") from exc

    def update(self, item_id: str, embedding: list[float], metadata: Optional[dict] = None) -> None:
        """Update the embedding (and optionally metadata) for *item_id*.

        Args:
            item_id: Clothing item identifier.
            embedding: Updated dense vector.
            metadata: Ignored in this implementation — clothing item
                      metadata lives in the ``attributes`` JSONB column
                      and is managed separately by the clothing API.

        Raises:
            VectorUpdateError: If the update fails.
        """
        pg_vec = to_pgvector(embedding)
        try:
            resp = (
                self._client.table("clothing_items")
                .update({"embedding": pg_vec})
                .eq("id", item_id)
                .execute()
            )
            if not resp.data:
                raise VectorUpdateError(f"item {item_id} not found for vector update")
        except VectorUpdateError:
            raise
        except Exception as exc:
            logger.error("pgvector update failed for item %s: %s", item_id, exc)
            raise VectorUpdateError(f"failed to update vector for {item_id}: {exc}") from exc

    def delete(self, item_id: str) -> None:
        """Nullify the embedding for *item_id*.

        The row itself is deleted by the clothing API; this only clears
        the embedding so the vector index doesn't reference a stale row.

        Args:
            item_id: Clothing item identifier.

        Raises:
            VectorDeleteError: If the update fails.
        """
        try:
            self._client.table("clothing_items").update({
                "embedding": None,
            }).eq("id", item_id).execute()
        except Exception as exc:
            logger.error("pgvector delete failed for item %s: %s", item_id, exc)
            raise VectorDeleteError(f"failed to delete vector for {item_id}: {exc}") from exc

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 20,
        filters: Optional[dict] = None,
    ) -> list[CandidateItem]:
        """Find the top-k most similar items via pgvector cosine distance.

        Uses the ``match_compatible_items`` RPC which computes
        ``1 - (embedding <=> query_embedding)`` and includes an ordering
        by cosine distance.

        When no category filter is provided, passes a broad set of
        compatible categories to avoid the RPC's category junction.

        Args:
            query_embedding: Dense query vector (1024-dim).
            top_k: Maximum results.
            filters: Optional dict; supported keys: ``category``, ``user_id``.

        Returns:
            List of ``CandidateItem`` sorted by similarity (highest first).

        Raises:
            VectorSearchError: If the search fails.
        """
        category_filter = filters.get("category") if filters else None
        user_id = filters.get("user_id") if filters else None

        compatible = [category_filter] if category_filter else [
            "top", "bottom", "dress", "footwear", "outerwear", "accessory",
        ]
        exclude_id = "00000000-0000-0000-0000-000000000000"

        try:
            resp = self._client.rpc(
                "match_compatible_items",
                {
                    "query_embedding": query_embedding,
                    "compatible_categories": compatible,
                    "exclude_id": exclude_id,
                    "match_count": top_k,
                },
            ).execute()
        except Exception as exc:
            logger.error("vector search via RPC failed: %s", exc)
            raise VectorSearchError(f"search failed: {exc}") from exc

        return self._rpc_rows_to_candidates(resp.data or [])

    def _rpc_rows_to_candidates(self, rows: list[dict]) -> list[CandidateItem]:
        candidates: list[CandidateItem] = []
        for row in rows:
            attrs = row.get("attributes") or {}
            cat = attrs.get("category", {})
            if isinstance(cat, dict):
                cat = cat.get("value", "")
            color = attrs.get("color", {})
            if isinstance(color, dict):
                color = color.get("value", "")

            candidates.append(CandidateItem(
                id=row["id"],
                attributes=attrs,
                thumbnail_url=row.get("thumbnail_url"),
                similarity_score=round(float(row.get("similarity", 0.0)), 6),
                category=str(cat) if cat else None,
                color=str(color) if color else None,
            ))
        return candidates

    def _rows_to_candidates(
        self, rows: list[dict], query_embedding: list[float]
    ) -> list[CandidateItem]:
        candidates: list[CandidateItem] = []
        for row in rows:
            attrs = row.get("attributes") or {}
            cat = attrs.get("category", {})
            if isinstance(cat, dict):
                cat = cat.get("value", "")
            color = attrs.get("color", {})
            if isinstance(color, dict):
                color = color.get("value", "")
            emb = from_pgvector(row.get("embedding"))
            similarity = _cosine_similarity(query_embedding, emb) if emb else 0.0

            candidates.append(CandidateItem(
                id=row["id"],
                attributes=attrs,
                thumbnail_url=row.get("thumbnail_url"),
                embedding=emb,
                similarity_score=round(similarity, 6),
                category=str(cat) if cat else None,
                color=str(color) if color else None,
            ))
        return candidates


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two pre-normalized vectors."""
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    return max(0.0, min(1.0, dot))
