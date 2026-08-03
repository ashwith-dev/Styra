"""Staging store for the two-phase analyze → save flow.

Every staged result is kept in the module-level ``_memory_store`` first;
the service-role-only ``pipeline_staging`` table (migration 004) is
written best-effort as a cross-process backup. If the Supabase insert
fails (e.g. table missing, PGRST205) the warning is swallowed and
staging continues in memory only. Every token is bound to the user who
created it, and entries expire after ``TTL`` — in memory as well as in
the database.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.models.pipeline import StageMetrics
from app.services.extraction.base_attributes import AIPipelineResult
from app.services.pipeline_service import PipelineResult
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

TABLE = "pipeline_staging"
TTL = timedelta(hours=1)

# Bound the in-memory store: abandoned analyze calls (user never saves)
# would otherwise accumulate full pipeline results forever.
_MAX_MEMORY_ENTRIES = 1_000

# In-memory fallback: pipeline_token -> (result, user_id, created_at)
_memory_store: dict[str, tuple[PipelineResult, str, datetime]] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _prune_memory() -> None:
    """Drop expired entries, then evict oldest-first if still oversized."""
    cutoff = _now() - TTL
    for token, entry in list(_memory_store.items()):
        if entry[2] < cutoff:
            del _memory_store[token]
    while len(_memory_store) > _MAX_MEMORY_ENTRIES:
        oldest = min(_memory_store, key=lambda t: _memory_store[t][2])
        del _memory_store[oldest]


def stage_pipeline_result(result: PipelineResult, user_id: str) -> None:
    """Stage a successful pipeline result in memory. Synchronous and cheap —
    called inline by the analyze endpoint so a save request that arrives
    immediately after the analyze response can always claim its token."""
    _memory_store[result.pipeline_token] = (result, user_id, _now())
    _prune_memory()


def persist_pipeline_result(result: PipelineResult, user_id: str) -> None:
    """Write the staged result to Supabase as a cross-process backup.

    Best-effort: failures (e.g. missing ``pipeline_staging`` table) are
    swallowed and staging continues in memory only.
    """
    try:
        client = get_supabase()
        client.table(TABLE).insert(
            {
                "token": result.pipeline_token,
                "user_id": user_id,
                "attributes": (
                    result.attributes.model_dump(mode="json")
                    if result.attributes
                    else None
                ),
                "original_image_url": result.original_image_url,
                "segmented_image_url": result.segmented_image_url,
                "thumbnail_url": result.thumbnail_url,
                "metrics": [m.model_dump() for m in result.metrics],
            }
        ).execute()

        # Opportunistic pruning of expired tokens (bucket lifecycle policies
        # remain the backstop for their orphaned images).
        try:
            client.table(TABLE).delete().lt(
                "created_at", (_now() - TTL).isoformat()
            ).execute()
        except Exception:
            logger.warning("Failed to prune expired pipeline tokens", exc_info=True)
    except Exception:
        logger.warning(
            "Supabase pipeline_staging insert failed; staged in memory only",
            exc_info=True,
        )


def store_pipeline_result(result: PipelineResult, user_id: str) -> None:
    """Stage in memory and persist the DB backup (combined helper)."""
    stage_pipeline_result(result, user_id)
    persist_pipeline_result(result, user_id)


def pop_pipeline_result(token: str, user_id: str) -> Optional[PipelineResult]:
    """Claim a staged result, checking the in-memory store first.

    A memory hit for the owning user returns immediately, provided the
    entry has not expired. Otherwise the claim falls back to a single
    DELETE ... RETURNING against Supabase (PostgREST returns the deleted
    rows), which is atomic across workers.
    Returns None when missing, owned by another user, or expired.
    """
    entry = _memory_store.pop(token, None)
    if entry is not None:
        stored_result, stored_user_id, created_at = entry
        if stored_user_id == user_id and _now() - created_at <= TTL:
            return stored_result

    try:
        client = get_supabase()
        resp = (
            client.table(TABLE)
            .delete()
            .eq("token", token)
            .eq("user_id", user_id)
            .execute()
        )
    except Exception:
        logger.warning(
            "Supabase pipeline_staging lookup failed for token", exc_info=True
        )
        return None

    rows = resp.data
    if not rows:
        return None
    row = rows[0]

    created = datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
    if _now() - created > TTL:
        return None

    return PipelineResult(
        pipeline_token=row["token"],
        original_image_path="",
        original_image_url=row["original_image_url"],
        segmented_image_url=row["segmented_image_url"],
        thumbnail_url=row.get("thumbnail_url"),
        attributes=(
            AIPipelineResult(**row["attributes"])
            if row.get("attributes")
            else None
        ),
        metrics=[StageMetrics(**m) for m in (row.get("metrics") or [])],
    )
