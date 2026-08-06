"""Supabase-backed embedding repository.

Low-level persistence layer for clothing item embeddings in the
``clothing_items.embedding`` column. No business logic — pure
read / write / delete operations.
"""

import logging
from typing import Optional

from app.ai.repositories.embedding_repository import EmbeddingRepository
from app.ai.utils.exceptions import AIEngineError
from app.ai.utils.pgvector_format import to_pgvector, from_pgvector

logger = logging.getLogger(__name__)


class SupabaseEmbeddingRepository(EmbeddingRepository):
    """Supabase implementation of ``EmbeddingRepository``.

    Reads and writes the ``embedding`` column on ``clothing_items``.
    """

    def __init__(self, supabase_client: object) -> None:
        """Initialise with a Supabase client.

        Args:
            supabase_client: Supabase ``Client`` (user-scoped or service-role).
        """
        self._client = supabase_client

    def save(self, item_id: str, embedding: list[float]) -> None:
        """Persist an embedding for a clothing item.

        Args:
            item_id: Clothing item ID.
            embedding: Dense vector.
        """
        pg_vec = to_pgvector(embedding)
        try:
            self._client.table("clothing_items").update({
                "embedding": pg_vec,
            }).eq("id", item_id).execute()
        except Exception as exc:
            logger.error("Failed to save embedding for item %s: %s", item_id, exc)
            raise AIEngineError(f"failed to save embedding: {exc}") from exc

    def get(self, item_id: str) -> Optional[list[float]]:
        """Retrieve a stored embedding for a clothing item.

        Args:
            item_id: Clothing item ID.

        Returns:
            The embedding vector if found, or ``None``.
        """
        try:
            resp = (
                self._client.table("clothing_items")
                .select("embedding")
                .eq("id", item_id)
                .maybe_single()
                .execute()
            )
        except Exception as exc:
            logger.error("Failed to get embedding for item %s: %s", item_id, exc)
            raise AIEngineError(f"failed to get embedding: {exc}") from exc

        row = resp.data
        if not row:
            return None
        return from_pgvector(row.get("embedding"))

    def delete(self, item_id: str) -> None:
        """Nullify the embedding for the given item.

        Args:
            item_id: Clothing item ID.
        """
        try:
            self._client.table("clothing_items").update({
                "embedding": None,
            }).eq("id", item_id).execute()
        except Exception as exc:
            logger.error("Failed to delete embedding for item %s: %s", item_id, exc)
            raise AIEngineError(f"failed to delete embedding: {exc}") from exc

    def batch_save(self, items: list[tuple[str, list[float]]]) -> None:
        """Persist multiple embeddings via individual updates.

        Supabase PostgREST doesn't support true batch upsert on the
        ``embedding`` column alone (each row needs its own ``id``), so
        we iterate. For large batches, this could be optimised with a
        stored procedure.

        Args:
            items: List of ``(item_id, embedding)`` tuples.
        """
        if not items:
            return
        for item_id, embedding in items:
            self.save(item_id, embedding)
