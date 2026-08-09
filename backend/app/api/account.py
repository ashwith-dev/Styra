import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.services.storage_service import get_storage_service
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter()

# App tables outside the alembic-managed schema (live-DB tables the mobile
# client writes to directly). Deleted best-effort before the auth user so
# nothing user-scoped survives account deletion.
_EXTRA_USER_TABLES = ("user_preferences", "user_statistics")


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(user_id: str = Depends(get_current_user)) -> None:
    """Permanently delete the caller's account and all associated data.

    Order matters: storage objects first (FK cascades can't touch storage),
    then auxiliary app tables, then the auth user — whose
    auth.users → profiles → clothing_items / outfit_feedback /
    outfit_favorites cascades remove every remaining database row.
    """
    admin = get_supabase()

    # 1. Remove storage objects.
    try:
        resp = await asyncio.to_thread(
            lambda: admin.table("clothing_items")
            .select("image_url, original_image_url, thumbnail_url")
            .eq("user_id", user_id)
            .execute()
        )
        storage = get_storage_service()
        for row in resp.data or []:
            for url in (
                row.get("image_url"),
                row.get("original_image_url"),
                row.get("thumbnail_url"),
            ):
                await asyncio.to_thread(storage.delete_by_public_url, url)
    except Exception:
        logger.warning("Account deletion: storage cleanup failed", exc_info=True)

    # 2. Remove rows in auxiliary app tables (no FK cascade to auth.users).
    for table in _EXTRA_USER_TABLES:
        try:
            await asyncio.to_thread(
                lambda t=table: admin.table(t).delete().eq("user_id", user_id).execute()
            )
        except Exception:
            logger.warning("Account deletion: %s cleanup failed", table, exc_info=True)
    try:
        await asyncio.to_thread(
            lambda: admin.table("users").delete().eq("id", user_id).execute()
        )
    except Exception:
        logger.warning("Account deletion: users cleanup failed", exc_info=True)

    # 3. Delete the auth user (cascades profiles → clothing_items, feedback,
    #    favorites). This is the step that must not fail silently.
    try:
        await asyncio.to_thread(admin.auth.admin.delete_user, user_id)
    except Exception as exc:
        logger.error("Account deletion failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account",
        )
