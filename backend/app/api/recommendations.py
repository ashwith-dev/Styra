from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user
from app.models.api_contract import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    OutfitItem,
    OutfitRecommendationItem,
    OutfitRecommendationResponse,
    OutfitFeedbackRequest,
    OutfitFeedbackResponse,
    OutfitFavoriteRequest,
    OutfitFavoriteResponse,
)
from app.services.recommendations.engine import RecommendationEngine
from app.services.supabase_client import get_supabase

router = APIRouter()

_recommendation_engine = RecommendationEngine()


# ── POST /recommendations  (existing — item-based similarity via pgvector) ──


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


# ── GET /recommendations  (new — outfit-based AI stylist engine) ──


@router.get("/recommendations", response_model=OutfitRecommendationResponse)
async def list_recommendations(
    occasion: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user),
) -> OutfitRecommendationResponse:
    """Generate full outfit recommendations from the user's wardrobe.

    Supports optional ``occasion`` and ``season`` filters.

    - ``occasion``: casual, formal, office, college, party, date_night,
      travel, gym, ethnic
    - ``season``: spring, summer, fall, winter
    """
    supabase = get_supabase()

    wardrobe_resp = (
        supabase.table("clothing_items")
        .select("id, attributes, thumbnail_url, status")
        .eq("user_id", user_id)
        .execute()
    )
    wardrobe = wardrobe_resp.data or []

    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No clothing items found in your wardrobe",
        )

    # Validate filters.
    if occasion:
        valid_occasions = {
            "casual", "formal", "office", "college", "party",
            "date_night", "travel", "gym", "ethnic",
        }
        if occasion.lower() not in valid_occasions:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid occasion '{occasion}'. Must be one of: {', '.join(sorted(valid_occasions))}",
            )

    if season:
        valid_seasons = {"spring", "summer", "fall", "winter"}
        if season.lower() not in valid_seasons:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid season '{season}'. Must be one of: {', '.join(sorted(valid_seasons))}",
            )

    try:
        recommendations = _recommendation_engine.recommend(
            wardrobe,
            occasion=occasion,
            season=season,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations",
        )

    result = []
    for rec in recommendations:
        outfit_items = [
            OutfitItem(
                id=item["id"],
                attributes=item.get("attributes", {}),
                thumbnail_url=item.get("thumbnail_url"),
            )
            for item in rec.items
        ]
        result.append(
            OutfitRecommendationItem(
                outfit_id=rec.outfit_id,
                outfit_items=outfit_items,
                score=rec.score,
                explanation=rec.explanation,
                outfit_category=rec.outfit_category,
            )
        )

    return OutfitRecommendationResponse(recommendations=result)


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


# ── POST /recommendations/feedback  — like/dislike an outfit ──


@router.post("/recommendations/feedback", response_model=OutfitFeedbackResponse)
async def submit_outfit_feedback(
    body: OutfitFeedbackRequest,
    user_id: str = Depends(get_current_user),
) -> OutfitFeedbackResponse:
    """Record like/dislike feedback for an outfit recommendation."""
    if body.feedback not in ("like", "dislike"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Feedback must be 'like' or 'dislike'",
        )

    supabase = get_supabase()

    existing = (
        supabase.table("outfit_feedback")
        .select("id")
        .eq("user_id", user_id)
        .eq("outfit_id", body.outfit_id)
        .execute()
    )
    if existing.data:
        supabase.table("outfit_feedback").update({"feedback": body.feedback}).eq(
            "id", existing.data[0]["id"]
        ).execute()
    else:
        supabase.table("outfit_feedback").insert({
            "user_id": user_id,
            "outfit_id": body.outfit_id,
            "feedback": body.feedback,
        }).execute()

    return OutfitFeedbackResponse(feedback=body.feedback)


# ── Favorites: POST /recommendations/favorites ──


@router.post("/recommendations/favorites", response_model=OutfitFavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_outfit_favorite(
    body: OutfitFavoriteRequest,
    user_id: str = Depends(get_current_user),
) -> OutfitFavoriteResponse:
    """Save an outfit recommendation as a favourite."""
    supabase = get_supabase()

    existing = (
        supabase.table("outfit_favorites")
        .select("id")
        .eq("user_id", user_id)
        .eq("outfit_id", body.outfit_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Outfit already saved",
        )

    resp = (
        supabase.table("outfit_favorites")
        .insert({
            "user_id": user_id,
            "outfit_id": body.outfit_id,
            "outfit_data": body.outfit_data.model_dump(),
        })
        .execute()
    )

    row = resp.data[0]
    return OutfitFavoriteResponse(
        id=row["id"],
        outfit_id=row["outfit_id"],
        created_at=row["created_at"],
    )


# ── DELETE /recommendations/favorites/{outfit_id} ──


@router.delete("/recommendations/favorites/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_outfit_favorite(
    outfit_id: str,
    user_id: str = Depends(get_current_user),
) -> None:
    """Remove a saved outfit favourite."""
    supabase = get_supabase()

    resp = (
        supabase.table("outfit_favorites")
        .delete()
        .eq("user_id", user_id)
        .eq("outfit_id", outfit_id)
        .execute()
    )

    if not resp.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved outfit not found",
        )


# ── GET /recommendations/favorites ──


@router.get("/recommendations/favorites")
async def list_outfit_favorites(
    user_id: str = Depends(get_current_user),
) -> list[dict]:
    """List all saved outfit favourites for the current user."""
    supabase = get_supabase()

    resp = (
        supabase.table("outfit_favorites")
        .select("id, outfit_id, outfit_data, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return resp.data or []


# ── GET /recommendations/favorites/{outfit_id} ──


@router.get("/recommendations/favorites/{outfit_id}")
async def check_outfit_favorite(
    outfit_id: str,
    user_id: str = Depends(get_current_user),
) -> dict:
    """Check if an outfit is saved as a favourite. Returns saved status."""
    supabase = get_supabase()

    resp = (
        supabase.table("outfit_favorites")
        .select("id")
        .eq("user_id", user_id)
        .eq("outfit_id", outfit_id)
        .execute()
    )

    return {"saved": len(resp.data or []) > 0}
