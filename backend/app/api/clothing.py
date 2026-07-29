import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.api_contract import (
    SaveClothingRequest,
    SaveClothingResponse,
    UpdateClothingRequest,
    ClothingItemDetail,
    ListClothingResponse,
    ClothingItemBrief,
)
from app.services.supabase_client import get_supabase
from app.services.pipeline_store import pop_pipeline_result
from app.services.embedding.attribute_embedder import AttributeEmbedder

logger = logging.getLogger(__name__)

router = APIRouter()

_embedder = AttributeEmbedder()


def _to_pgvector(embedding: list[float] | None) -> str | None:
    return f"[{','.join(str(v) for v in embedding)}]" if embedding else None


@router.post("/clothing", response_model=SaveClothingResponse, status_code=201)
async def save_clothing(
    body: SaveClothingRequest,
    user_id: str = Depends(get_current_user),
) -> SaveClothingResponse:
    supabase = get_supabase()

    staged = await asyncio.to_thread(
        pop_pipeline_result, body.pipeline_token, user_id
    )
    if staged is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline token not found or expired",
        )

    try:
        supabase.table("profiles").upsert({"id": user_id}, on_conflict="id").execute()
    except Exception as exc:
        logger.warning("Profile upsert warning: %s", exc)

    data = {
        "user_id": user_id,
        "original_image_url": staged.original_image_url,
        "segmented_image_url": staged.segmented_image_url,
        "thumbnail_url": staged.thumbnail_url,
        "attributes": body.attributes,
        "embedding": _to_pgvector(_embedder.embed_attributes(body.attributes)),
        "raw_pipeline_result": (
            staged.attributes.model_dump(mode="json")
            if staged.attributes
            else None
        ),
        "pipeline_metrics": {
            m.stage: {"status": m.status, "duration_ms": m.duration_ms}
            for m in staged.metrics
        },
        "status": "completed",
    }

    try:
        resp = supabase.table("clothing_items").insert(data).execute()
        if not resp.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save clothing item",
            )

        row = resp.data[0]
        return SaveClothingResponse(
            id=row["id"],
            original_image_url=row["original_image_url"],
            segmented_image_url=row["segmented_image_url"],
            thumbnail_url=row.get("thumbnail_url"),
            attributes=row["attributes"],
        )
    except Exception as exc:
        logger.error("Failed to insert clothing item: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save item: {exc}",
        )


@router.get("/clothing", response_model=ListClothingResponse)
async def list_clothing(
    user_id: str = Depends(get_current_user),
    limit: int = 1000,
    offset: int = 0,
) -> ListClothingResponse:
    try:
        supabase = get_supabase()

        total_count = 0
        try:
            total_resp = (
                supabase.table("clothing_items")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total_count = total_resp.count if hasattr(total_resp, "count") and total_resp.count else 0
        except Exception:
            total_count = 0

        resp = (
            supabase.table("clothing_items")
            .select(
                "id, original_image_url, segmented_image_url, "
                "thumbnail_url, attributes, status, created_at"
            )
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        items = [
            ClothingItemBrief(
                id=r["id"],
                original_image_url=r["original_image_url"],
                segmented_image_url=r["segmented_image_url"],
                thumbnail_url=r.get("thumbnail_url"),
                attributes=r["attributes"],
                status=r["status"],
                created_at=r["created_at"],
            )
            for r in (resp.data or [])
        ]
        return ListClothingResponse(items=items, total_count=total_count)
    except Exception as exc:
        logger.warning("list_clothing error (%s); returning empty wardrobe", exc)
        return ListClothingResponse(items=[], total_count=0)


@router.get("/clothing/{item_id}", response_model=ClothingItemDetail)
async def get_clothing_item(
    item_id: str,
    user_id: str = Depends(get_current_user),
) -> ClothingItemDetail:
    supabase = get_supabase()
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

        r = resp.data
        return ClothingItemDetail(
            id=r["id"],
            original_image_url=r["original_image_url"],
            segmented_image_url=r["segmented_image_url"],
            thumbnail_url=r.get("thumbnail_url"),
            attributes=r["attributes"],
            raw_pipeline_result=r.get("raw_pipeline_result"),
            pipeline_metrics=r.get("pipeline_metrics"),
            status=r["status"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )


@router.patch("/clothing/{item_id}", response_model=ClothingItemDetail)
async def update_clothing_item(
    item_id: str,
    body: UpdateClothingRequest,
    user_id: str = Depends(get_current_user),
) -> ClothingItemDetail:
    supabase = get_supabase()
    try:
        resp = (
            supabase.table("clothing_items")
            .update({"attributes": body.attributes})
            .eq("id", item_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        r = resp.data[0]
        return ClothingItemDetail(
            id=r["id"],
            original_image_url=r["original_image_url"],
            segmented_image_url=r["segmented_image_url"],
            thumbnail_url=r.get("thumbnail_url"),
            attributes=r["attributes"],
            raw_pipeline_result=r.get("raw_pipeline_result"),
            pipeline_metrics=r.get("pipeline_metrics"),
            status=r["status"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )


@router.delete("/clothing/{item_id}", status_code=204)
async def delete_clothing_item(
    item_id: str,
    user_id: str = Depends(get_current_user),
) -> None:
    supabase = get_supabase()
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
