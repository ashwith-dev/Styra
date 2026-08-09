"""Supabase-backed wardrobe repository.

Fetches wardrobe items from the ``clothing_items`` table via a
user-scoped Supabase client (RLS enforced).
"""

import logging
from typing import Optional

from app.ai.models.candidate import CandidateItem
from app.ai.repositories.wardrobe_repository import WardrobeRepository
from app.ai.utils.exceptions import AIEngineError
from app.ai.utils.text_builder import build_semantic_text
from app.services.storage_service import get_storage_service

logger = logging.getLogger(__name__)


def _is_missing_status_column_error(exc: Exception) -> bool:
    # Only match the genuine undefined-column error — a bare "status"
    # substring would swallow unrelated errors (HTTP status codes, …) and
    # retry without the status=completed filter, leaking unprocessed items.
    err_str = str(exc)
    return "column clothing_items.status does not exist" in err_str or "42703" in err_str


class SupabaseWardrobeRepository(WardrobeRepository):
    """Supabase implementation of ``WardrobeRepository``.

    Fetches completed clothing items for a user. Uses the user-scoped
    Supabase client so RLS policies apply automatically.
    """

    def __init__(self, supabase_client: object) -> None:
        """Initialise with a Supabase client.

        Args:
            supabase_client: User-scoped Supabase ``Client``.
        """
        self._client = supabase_client

    _COLUMNS = "id, attributes, thumbnail_url, original_image_url"
    _COLUMNS_WITH_EMBEDDING = _COLUMNS + ", embedding"

    def fetch_all_for_user(
        self,
        user_id: str,
        *,
        include_embedding: bool = False,
    ) -> list[CandidateItem]:
        """Retrieve all completed wardrobe items for *user_id*.

        Returns items that have been fully processed. The (large)
        embedding column is only selected when *include_embedding* is
        True — the default outfit pipeline never uses it.
        """
        columns = self._COLUMNS_WITH_EMBEDDING if include_embedding else self._COLUMNS
        try:
            try:
                resp = (
                    self._client.table("clothing_items")
                    .select(columns)
                    .eq("user_id", user_id)
                    .eq("status", "completed")
                    .execute()
                )
            except Exception as exc:
                if _is_missing_status_column_error(exc):
                    resp = (
                        self._client.table("clothing_items")
                        .select(columns)
                        .eq("user_id", user_id)
                        .execute()
                    )
                else:
                    raise
        except Exception as exc:
            logger.error("Failed to fetch wardrobe for user %s: %s", user_id, exc)
            raise AIEngineError(f"failed to fetch wardrobe: {exc}") from exc

        return self._rows_to_candidates(resp.data or [])

    def fetch_by_ids(self, item_ids: list[str], user_id: str) -> list[CandidateItem]:
        """Retrieve specific items by ID.

        Uses individual queries since Supabase Python SDK doesn't
        support ``in_`` with multi-column filters cleanly.
        """
        if not item_ids:
            return []
        try:
            resp = (
                self._client.table("clothing_items")
                .select("id, attributes, thumbnail_url, original_image_url, embedding")
                .eq("user_id", user_id)
                .in_("id", item_ids)
                .execute()
            )
        except Exception as exc:
            logger.error("Failed to fetch items by ids for user %s: %s", user_id, exc)
            raise AIEngineError(f"failed to fetch items: {exc}") from exc

        return self._rows_to_candidates(resp.data or [])

    def count_for_user(self, user_id: str) -> int:
        """Return the count of completed wardrobe items for *user_id*."""
        try:
            try:
                resp = (
                    self._client.table("clothing_items")
                    .select("id", count="exact")
                    .eq("user_id", user_id)
                    .eq("status", "completed")
                    .execute()
                )
            except Exception as exc:
                if _is_missing_status_column_error(exc):
                    resp = (
                        self._client.table("clothing_items")
                        .select("id", count="exact")
                        .eq("user_id", user_id)
                        .execute()
                    )
                else:
                    raise
            return resp.count if hasattr(resp, "count") and resp.count else 0
        except Exception as exc:
            logger.error("Failed to count wardrobe for user %s: %s", user_id, exc)
            raise AIEngineError(f"failed to count wardrobe: {exc}") from exc

    def fetch_semantic_texts(self, user_id: str) -> list[tuple[str, str]]:
        """Fetch item IDs and their semantic text representations.

        Returns a list of ``(item_id, semantic_text)`` pairs for all
        completed items belonging to *user_id*.
        """
        try:
            try:
                resp = (
                    self._client.table("clothing_items")
                    .select("id, attributes")
                    .eq("user_id", user_id)
                    .eq("status", "completed")
                    .execute()
                )
            except Exception as exc:
                if _is_missing_status_column_error(exc):
                    resp = (
                        self._client.table("clothing_items")
                        .select("id, attributes")
                        .eq("user_id", user_id)
                        .execute()
                    )
                else:
                    raise
        except Exception as exc:
            logger.error("Failed to fetch semantic texts for user %s: %s", user_id, exc)
            raise AIEngineError(f"failed to fetch semantic texts: {exc}") from exc

        results: list[tuple[str, str]] = []
        for row in resp.data or []:
            attrs = row.get("attributes") or {}
            text = build_semantic_text(attrs)
            if text:
                results.append((row["id"], text))
        return results

    @staticmethod
    def _rows_to_candidates(rows: list[dict]) -> list[CandidateItem]:
        candidates: list[CandidateItem] = []
        for row in rows:
            attrs = row.get("attributes") or {}
            cat = _extract_attr_value(attrs, "category")
            color = _extract_attr_value(attrs, "color")
            season_raw = attrs.get("season", [])
            occasion_raw = attrs.get("occasion", [])
            season = _extract_list_first(season_raw) if isinstance(season_raw, list) else None
            occasion = _extract_list_first(occasion_raw) if isinstance(occasion_raw, list) else None
            style = _extract_attr_value(attrs, "style")

            embedding = None
            raw_emb = row.get("embedding")
            if raw_emb and isinstance(raw_emb, str):
                emb_str = raw_emb.strip("[]")
                if emb_str:
                    embedding = [float(x) for x in emb_str.split(",")]
            elif isinstance(raw_emb, list):
                embedding = [float(v) for v in raw_emb]

            candidates.append(CandidateItem(
                id=row["id"],
                attributes=attrs,
                thumbnail_url=row.get("thumbnail_url"),
                original_image_url=row.get("original_image_url"),
                embedding=embedding,
                category=str(cat) if cat else None,
                color=str(color) if color else None,
                season=str(season) if season else None,
                occasion=str(occasion) if occasion else None,
                style=str(style) if style else None,
            ))

        # Refresh signed URLs so images in generated outfits are never
        # expired — batched per bucket, not one HTTP call per candidate.
        storage = get_storage_service()
        refreshed_rows = storage.refresh_urls_for_rows([
            {"thumbnail_url": c.thumbnail_url, "original_image_url": c.original_image_url}
            for c in candidates
        ])
        for c, fresh in zip(candidates, refreshed_rows):
            c.thumbnail_url = fresh.get("thumbnail_url") or c.thumbnail_url
            c.original_image_url = fresh.get("original_image_url") or c.original_image_url
        return candidates


def _extract_attr_value(attrs: dict, key: str) -> Optional[str]:
    val = attrs.get(key)
    if isinstance(val, dict):
        val = val.get("value")
    if isinstance(val, str) and val.strip():
        return val.strip()
    return None


def _extract_list_first(entries: list) -> Optional[str]:
    if not entries:
        return None
    first = entries[0]
    if isinstance(first, dict):
        first = first.get("value")
    if isinstance(first, str) and first.strip():
        return first.strip()
    return None
