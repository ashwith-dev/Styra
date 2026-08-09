import asyncio
import logging
import re
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_current_user
from app.models.api_contract import (
    SaveClothingRequest,
    SaveClothingResponse,
    UpdateClothingRequest,
    ClothingItemDetail,
    ListClothingResponse,
    ClothingItemBrief,
)
from app.services.supabase_client import get_supabase, get_user_client
from app.services.pipeline_store import pop_pipeline_result
from app.services.clothing_mapper import attributes_to_row, row_to_attributes
from app.services.storage_service import get_storage_service
from app.utils.jwt import get_token, get_user_supabase
from app.utils.attribute_validation import normalize_attributes, validate_attributes
from app.ai.providers.singletons import generate_embedding_pgvector

logger = logging.getLogger(__name__)

router = APIRouter()

# Columns the insert can live without if the live table hasn't been
# migrated yet (PostgREST PGRST204). Core columns never get dropped.
_OPTIONAL_INSERT_COLUMNS = ("embedding", "attributes")

_LIST_COLUMNS = (
    "id, image_url, original_image_url, thumbnail_url, "
    "category, subcategory, color, season, occasion, brand, "
    "ai_tags, attributes, created_at"
)


def _missing_column(exc: Exception) -> str | None:
    """Extract the column name from a PostgREST missing-column error."""
    match = re.search(r"Could not find the '(\w+)' column", str(exc))
    return match.group(1) if match else None


def _insert_item(supabase, data: dict):
    """Insert into clothing_items, dropping a not-yet-migrated optional
    column and retrying once when PostgREST rejects it (PGRST204)."""
    try:
        return supabase.table("clothing_items").insert(data).execute()
    except Exception as exc:
        column = _missing_column(exc)
        if column not in _OPTIONAL_INSERT_COLUMNS:
            raise
        logger.warning(
            "clothing_items.%s missing from schema cache; retrying insert without it",
            column,
        )
        data = {k: v for k, v in data.items() if k != column}
        return supabase.table("clothing_items").insert(data).execute()


def _to_detail(r: dict) -> ClothingItemDetail:
    return ClothingItemDetail(
        id=r["id"],
        original_image_url=r["original_image_url"],
        segmented_image_url=r["image_url"],
        thumbnail_url=r.get("thumbnail_url"),
        attributes=row_to_attributes(r),
        raw_pipeline_result=None,
        pipeline_metrics=None,
        status="completed",
        created_at=r["created_at"],
        updated_at=r["updated_at"],
    )


@router.post("/clothing", response_model=SaveClothingResponse, status_code=201)
async def save_clothing(
    body: SaveClothingRequest,
    user_id: str = Depends(get_current_user),
    user_client: Client = Depends(get_user_supabase),
) -> SaveClothingResponse:
    admin = get_supabase()

    validation_errors = validate_attributes(body.attributes)
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Invalid attributes",
                "errors": validation_errors,
            },
        )

    # Snap enumerable values to canonical taxonomy form before persisting.
    body.attributes = normalize_attributes(body.attributes)

    staged = await asyncio.to_thread(
        pop_pipeline_result, body.pipeline_token, user_id
    )
    if staged is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline token not found or expired",
        )

    try:
        await asyncio.to_thread(
            lambda: admin.table("users").upsert({"id": user_id}, on_conflict="id").execute()
        )
    except Exception as exc:
        logger.warning("User row upsert warning: %s", exc)

    # CPU-bound (BGE-M3 encode) — keep it off the event loop.
    embedding = await asyncio.to_thread(generate_embedding_pgvector, body.attributes)

    data = {
        "user_id": user_id,
        "image_url": staged.segmented_image_url,
        "original_image_url": staged.original_image_url,
        "thumbnail_url": staged.thumbnail_url,
        **attributes_to_row(body.attributes),
        "embedding": embedding,
    }

    try:
        resp = await asyncio.to_thread(_insert_item, user_client, data)
    except Exception as exc:
        logger.error("Failed to insert clothing item: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save item",
        )

    if not resp.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save clothing item",
        )

    row = resp.data[0]
    return SaveClothingResponse(
        id=row["id"],
        original_image_url=row["original_image_url"],
        segmented_image_url=row["image_url"],
        thumbnail_url=row.get("thumbnail_url"),
        attributes=row_to_attributes(row),
    )


@router.get("/clothing", response_model=ListClothingResponse)
async def list_clothing(
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
    limit: int = Query(default=1000, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> ListClothingResponse:
    total_count = 0
    try:
        total_resp = await asyncio.to_thread(
            lambda: supabase.table("clothing_items")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total_count = total_resp.count if hasattr(total_resp, "count") and total_resp.count else 0
    except Exception as exc:
        logger.warning("list_clothing count query failed (%s); continuing without total", exc)

    resp = await asyncio.to_thread(
        lambda: supabase.table("clothing_items")
        .select(_LIST_COLUMNS)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    storage = get_storage_service()
    refreshed_rows = await asyncio.to_thread(
        storage.refresh_urls_for_rows, resp.data or []
    )
    items = [
        ClothingItemBrief(
            id=r["id"],
            original_image_url=r["original_image_url"],
            segmented_image_url=r["image_url"],
            thumbnail_url=r.get("thumbnail_url"),
            attributes=row_to_attributes(r),
            status="completed",
            created_at=r["created_at"],
        )
        for r in refreshed_rows
    ]
    return ListClothingResponse(items=items, total_count=total_count)


@router.get("/clothing/{item_id}", response_model=ClothingItemDetail)
async def get_clothing_item(
    item_id: UUID,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
) -> ClothingItemDetail:
    try:
        resp = await asyncio.to_thread(
            lambda: supabase.table("clothing_items")
            .select("*")
            .eq("id", str(item_id))
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        # Refresh signed URLs so images are never expired for the client.
        refreshed = await asyncio.to_thread(
            get_storage_service().refresh_urls_for_row, resp.data
        )
        return _to_detail(refreshed)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_clothing_item failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve item",
        )


@router.patch("/clothing/{item_id}", response_model=ClothingItemDetail)
async def update_clothing_item(
    item_id: UUID,
    body: UpdateClothingRequest,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
) -> ClothingItemDetail:
    validation_errors = validate_attributes(body.attributes)
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Invalid attributes",
                "errors": validation_errors,
            },
        )

    try:
        body.attributes = normalize_attributes(body.attributes)
        update_data = attributes_to_row(body.attributes)
        # CPU-bound (BGE-M3 encode) — keep it off the event loop.
        embedding = await asyncio.to_thread(generate_embedding_pgvector, body.attributes)
        if embedding is not None:
            update_data["embedding"] = embedding

        resp = await asyncio.to_thread(
            lambda: supabase.table("clothing_items")
            .update(update_data)
            .eq("id", str(item_id))
            .eq("user_id", user_id)
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return _to_detail(resp.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("update_clothing_item failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update item",
        )


@router.delete("/clothing/{item_id}", status_code=204)
async def delete_clothing_item(
    item_id: UUID,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
) -> None:
    try:
        # Fetch first so the storage objects can be removed with the row;
        # otherwise the public bucket files are orphaned forever.
        row_resp = await asyncio.to_thread(
            lambda: supabase.table("clothing_items")
            .select("image_url, original_image_url, thumbnail_url")
            .eq("id", str(item_id))
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not row_resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        resp = await asyncio.to_thread(
            lambda: supabase.table("clothing_items")
            .delete()
            .eq("id", str(item_id))
            .eq("user_id", user_id)
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        storage = get_storage_service()
        for url in (
            row_resp.data.get("image_url"),
            row_resp.data.get("original_image_url"),
            row_resp.data.get("thumbnail_url"),
        ):
            await asyncio.to_thread(storage.delete_by_public_url, url)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("delete_clothing_item failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete item",
        )
