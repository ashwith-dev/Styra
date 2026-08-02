import asyncio
import logging
import re

from fastapi import APIRouter, Depends, HTTPException, status
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
from app.services.embedding.attribute_embedder import AttributeEmbedder
from app.services.clothing_mapper import attributes_to_row, row_to_attributes
from app.utils.jwt import get_token, get_user_supabase
from app.utils.attribute_validation import validate_attributes

logger = logging.getLogger(__name__)

router = APIRouter()

_embedder = AttributeEmbedder()

# Columns the insert can live without if the live table hasn't been
# migrated yet (PostgREST PGRST204). Core columns never get dropped.
_OPTIONAL_INSERT_COLUMNS = ("embedding", "attributes")

_LIST_COLUMNS = (
    "id, image_url, original_image_url, thumbnail_url, "
    "category, subcategory, color, season, occasion, brand, "
    "ai_tags, attributes, created_at"
)


def _to_pgvector(embedding: list[float] | None) -> str | None:
    return f"[{','.join(str(v) for v in embedding)}]" if embedding else None


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
    supabase_admin: Client = Depends(get_user_supabase),
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

    staged = await asyncio.to_thread(
        pop_pipeline_result, body.pipeline_token, user_id
    )
    if staged is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline token not found or expired",
        )

    try:
        admin.table("users").upsert({"id": user_id}, on_conflict="id").execute()
    except Exception as exc:
        logger.warning("User row upsert warning: %s", exc)

    data = {
        "user_id": user_id,
        "image_url": staged.segmented_image_url,
        "original_image_url": staged.original_image_url,
        "thumbnail_url": staged.thumbnail_url,
        **attributes_to_row(body.attributes),
        "embedding": _to_pgvector(_embedder.embed_attributes(body.attributes)),
    }

    try:
        resp = _insert_item(supabase_admin, data)
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
    limit: int = 1000,
    offset: int = 0,
) -> ListClothingResponse:
    total_count = 0
    try:
        total_resp = (
            supabase.table("clothing_items")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total_count = total_resp.count if hasattr(total_resp, "count") and total_resp.count else 0
    except Exception as exc:
        logger.warning("list_clothing count query failed (%s); continuing without total", exc)

    resp = (
        supabase.table("clothing_items")
        .select(_LIST_COLUMNS)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
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
        for r in (resp.data or [])
    ]
    return ListClothingResponse(items=items, total_count=total_count)


@router.get("/clothing/{item_id}", response_model=ClothingItemDetail)
async def get_clothing_item(
    item_id: str,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
) -> ClothingItemDetail:
    try:
        resp = (
            supabase.table("clothing_items")
            .select("*")
            .eq("id", item_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return _to_detail(resp.data)
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
    item_id: str,
    body: UpdateClothingRequest,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
) -> ClothingItemDetail:
    try:
        resp = (
            supabase.table("clothing_items")
            .update(attributes_to_row(body.attributes))
            .eq("id", item_id)
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
    item_id: str,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
) -> None:
    try:
        resp = (
            supabase.table("clothing_items")
            .delete()
            .eq("id", item_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("delete_clothing_item failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete item",
        )
