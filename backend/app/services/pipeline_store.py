"""DB-backed staging store for the two-phase analyze → save flow.

Replaces the previous in-memory dict, which was unbounded, had no TTL,
held raw image bytes forever, and broke under multi-worker deployments.
Rows live in the service-role-only ``pipeline_staging`` table
(migration 003), every token is bound to the user who created it, and
entries expire after ``TTL``.
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


def _now() -> datetime:
    return datetime.now(timezone.utc)


def store_pipeline_result(result: PipelineResult, user_id: str) -> None:
    """Stage a successful pipeline result for the later save call."""
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


def pop_pipeline_result(token: str, user_id: str) -> Optional[PipelineResult]:
    """Atomically claim a staged result via a single DELETE ... RETURNING
    (PostgREST returns the deleted rows). Returns None when missing, owned
    by another user, or expired.

    Because the read and delete are one statement, two concurrent saves
    with the same token cannot both succeed — Postgres returns the row to
    exactly one of them.
    """
    client = get_supabase()
    resp = (
        client.table(TABLE)
        .delete()
        .eq("token", token)
        .eq("user_id", user_id)
        .execute()
    )
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
