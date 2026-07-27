from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.api_contract import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
)
from app.services.supabase_client import get_supabase

router = APIRouter()


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    body: RecommendationRequest,
    user_id: str = Depends(get_current_user),
) -> RecommendationResponse:
    """Find compatible clothing items from the same user's wardrobe.

    Uses pgvector cosine similarity to find items in the same broad category
    (e.g. tops go with bottoms, outerwear goes with everything) with matching
    style / season attributes.
    """
    supabase = get_supabase()

    # 1. Fetch the source item to get its category and embedding
    source_resp = (
        supabase.table("clothing_items")
        .select("id, attributes, embedding")
        .eq("id", body.clothing_item_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not source_resp.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    source = source_resp.data
    source_attrs = source.get("attributes", {})
    source_category = source_attrs.get("category", {}).get("value", "")

    # 2. Determine compatible categories
    compatible = _compatible_categories(source_category)
    if not compatible or not source.get("embedding"):
        return RecommendationResponse(
            source_item_id=body.clothing_item_id,
            recommendations=[],
        )

    # 3. pgvector cosine similarity query
    embedding = source["embedding"]
    rpc_resp = supabase.rpc(
        "match_compatible_items",
        {
            "p_user_id": user_id,
            "query_embedding": embedding,
            "compatible_categories": compatible,
            "exclude_id": body.clothing_item_id,
            "match_count": body.limit,
        },
    ).execute()

    recs = []
    for row in rpc_resp.data or []:
        recs.append(
            RecommendationItem(
                id=row["id"],
                attributes=row.get("attributes", {}),
                thumbnail_url=row.get("thumbnail_url"),
                similarity_score=row.get("similarity", 0.0),
            )
        )

    return RecommendationResponse(
        source_item_id=body.clothing_item_id,
        recommendations=recs,
    )


def _compatible_categories(category: str) -> list[str]:
    mapping = {
        "top": ["bottom", "outerwear", "accessory"],
        "bottom": ["top", "outerwear", "footwear", "accessory"],
        "dress": ["outerwear", "footwear", "accessory"],
        "outerwear": ["top", "bottom", "dress", "accessory"],
        "footwear": ["bottom", "dress", "outerwear"],
        "accessory": ["top", "bottom", "dress", "outerwear"],
    }
    return mapping.get(category, [])
