"""Staging store for the two-phase analyze → save flow.

Every staged result is kept in the module-level ``_memory_store`` first;
the service-role-only ``pipeline_staging`` table (migration 003) is
written best-effort as a cross-process backup. If the Supabase insert
fails (e.g. table missing, PGRST205) the warning is swallowed and
staging continues in memory only. Every token is bound to the user who
created it, and DB entries expire after ``TTL``.
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

# In-memory fallback: pipeline_token -> (result, user_id)
_memory_store: dict[str, tuple[PipelineResult, str]] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def store_pipeline_result(result: PipelineResult, user_id: str) -> None:
    """Stage a successful pipeline result for the later save call.

    Always stored in memory; the Supabase insert is best-effort and its
    failures (e.g. missing ``pipeline_staging`` table) are swallowed.
    """
    _memory_store[result.pipeline_token] = (result, user_id)

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


def pop_pipeline_result(token: str, user_id: str) -> Optional[PipelineResult]:
    """Claim a staged result, checking the in-memory store first.

    A memory hit for the owning user returns immediately. Otherwise the
    claim falls back to a single DELETE ... RETURNING against Supabase
    (PostgREST returns the deleted rows), which is atomic across workers.
    Returns None when missing, owned by another user, or expired.
    """
    entry = _memory_store.pop(token, None)
    if entry is not None:
        stored_result, stored_user_id = entry
        if stored_user_id == user_id:
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
