"""Outfit actions API — regenerate, wear, history, saved.

Thin orchestration — all intelligence stays in the engines.
"""

import asyncio
import logging
import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_current_user
from app.models.api_contract import (
    OutfitGenerationResponse,
    OutfitItemResponse,
    OutfitHistoryItem,
    OutfitHistoryResponse,
    RegenerateRequest,
    ScoreBreakdownItem,
    ScoreResponse,
    StylistResponse,
    MetadataResponse,
    WearOutfitRequest,
)
from app.ai.engine.filter_engine import FilterEngine, FilterContext
from app.ai.engine.ranking_engine import RankingEngine
from app.ai.engine.scoring_config import STYLIST_TIMEOUT_SECONDS
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.gemini_stylist import GeminiStylist
from app.ai.repositories.supabase_wardrobe_repository import SupabaseWardrobeRepository
from app.utils.jwt import get_token, get_user_supabase

logger = logging.getLogger(__name__)

router = APIRouter()

# Strong references to in-flight history-persistence tasks so they can't
# be garbage-collected mid-run (same pattern as app.api.outfits).
_HISTORY_TASKS: set[asyncio.Task] = set()

_VALID_OCCASIONS = {
    "casual", "formal", "office", "college", "party", "wedding",
    "travel", "gym", "home", "date", "festive", "business_casual",
    "smart_casual", "date_night",
}
_VALID_STYLES = {
    "casual", "formal", "sporty", "bohemian", "minimalist",
    "vintage", "edgy", "preppy", "romantic", "athleisure", "streetwear",
}
_MAX_EXCLUDED_IDS = 100

_FILTER_ENGINE: Optional[FilterEngine] = None


def _get_filter_engine() -> FilterEngine:
    global _FILTER_ENGINE
    if _FILTER_ENGINE is None:
        _FILTER_ENGINE = FilterEngine()
    return _FILTER_ENGINE


def _season_for_date() -> str:
    month = datetime.now(timezone.utc).month
    if 3 <= month <= 5:
        return "spring"
    elif 6 <= month <= 8:
        return "summer"
    elif 9 <= month <= 11:
        return "fall"
    return "winter"


def _temperature_to_level(temp: float) -> str:
    if temp > 35:
        return "hot"
    elif temp > 25:
        return "warm"
    elif temp > 15:
        return "mild"
    elif temp > 5:
        return "cool"
    else:
        return "cold"


def _attr_value(attrs: dict, key: str) -> Optional[str]:
    val = attrs.get(key)
    if isinstance(val, dict):
        val = val.get("value")
    if isinstance(val, str) and val.strip():
        return val.strip()
    return None


# ── POST /outfits/regenerate ──


@router.post("/outfits/regenerate", response_model=OutfitGenerationResponse)
async def regenerate_outfit(
    body: RegenerateRequest,
    user_id: str = Depends(get_current_user),
    user_client: Client = Depends(get_user_supabase),
    token: str = Depends(get_token),
) -> OutfitGenerationResponse:
    """Regenerate an outfit excluding previously selected items."""
    request_id = uuid.uuid4().hex[:12]
    t_start = time.monotonic()

    occasion = body.occasion.strip().lower() if body.occasion else None
    style = body.style.strip().lower() if body.style else None

    excluded: list[str] = []

    if body.previous_outfit_id:
        try:
            prev_items = await asyncio.to_thread(
                lambda: user_client.table("generated_outfit_items")
                .select("clothing_item_id")
                .eq("outfit_id", body.previous_outfit_id)
                .execute()
            )
            for row in prev_items.data or []:
                excluded.append(row["clothing_item_id"])
        except Exception as exc:
            logger.warning("Could not load previous outfit %s items: %s", body.previous_outfit_id, exc)

    if not excluded and body.request_id:
        try:
            prev = await asyncio.to_thread(
                lambda: user_client.table("generated_outfits")
                .select("id")
                .eq("request_id", body.request_id)
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            if prev.data:
                prev_items = await asyncio.to_thread(
                    lambda: user_client.table("generated_outfit_items")
                    .select("clothing_item_id")
                    .eq("outfit_id", prev.data["id"])
                    .execute()
                )
                for row in prev_items.data or []:
                    excluded.append(row["clothing_item_id"])
        except Exception as exc:
            logger.warning("Could not resolve previous request_id %s: %s", body.request_id, exc)

    excluded = list(set(excluded))

    temperature_level: Optional[str] = None
    if body.weather and body.weather.temperature is not None:
        temperature_level = _temperature_to_level(body.weather.temperature)

    repo = SupabaseWardrobeRepository(user_client)
    try:
        wardrobe = await asyncio.to_thread(repo.fetch_all_for_user, user_id)
    except Exception as exc:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to retrieve wardrobe")

    if not wardrobe:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No items in wardrobe.")

    context = FilterContext(
        season=_season_for_date(),
        occasion=occasion,
        temperature=temperature_level,
        outfit_category=occasion or "casual",
        excluded_item_ids=excluded,
    )

    ranking = RankingEngine(_get_filter_engine())
    try:
        candidate_set = await asyncio.to_thread(ranking.generate_candidates, wardrobe, context, top_n=5)
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Generation failed")

    if not candidate_set.candidates:
        if excluded:
            context2 = FilterContext(
                season=_season_for_date(),
                occasion=occasion,
                temperature=temperature_level,
                outfit_category=occasion or "casual",
            )
            try:
                candidate_set = await asyncio.to_thread(ranking.generate_candidates, wardrobe, context2, top_n=5)
            except Exception:
                raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Generation failed")

    if not candidate_set.candidates:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No alternative outfits available. Try changing your occasion or style.")

    gemini = GeminiProvider()
    stylist = GeminiStylist(gemini)
    try:
        result = await asyncio.wait_for(
            stylist.select(candidate_set, context, style_preference=style),
            timeout=STYLIST_TIMEOUT_SECONDS,
        )
    except Exception as exc:
        logger.warning("Stylist selection failed for user %s; sampling from top candidates: %s", user_id, exc)
        from app.ai.providers.gemini_stylist import StylistResult, weighted_sample_top_k
        best = weighted_sample_top_k(candidate_set.candidates)
        result = StylistResult(selected=best, confidence=best.score, reason=f"Score: {best.score:.2f}", fallback=True, fallback_reason="stylist error")

    selected = result.selected
    outfit_dict: dict = {}
    for item in selected.items:
        slot = item.category or "unknown"
        entry = OutfitItemResponse(
            id=item.id, category=item.category,
            type=_attr_value(item.attributes or {}, "type"),
            color=item.color, attributes=item.attributes or {},
            thumbnail_url=item.thumbnail_url,
            image_url=item.original_image_url,
        )
        if slot in ("top", "bottom", "footwear", "outerwear", "dress"):
            outfit_dict[slot] = entry.model_dump()
        elif slot == "accessory":
            if "accessories" not in outfit_dict:
                outfit_dict["accessories"] = []
            outfit_dict["accessories"].append(entry.model_dump())

    breakdown = [
        ScoreBreakdownItem(dimension=c.dimension, score=c.raw_score, weight=c.weight, weighted_score=c.weighted_score)
        for c in selected.score_breakdown
    ]
    t_total = (time.monotonic() - t_start) * 1000
    generated_at = datetime.now(timezone.utc).isoformat()

    history_task = asyncio.create_task(_save_outfit_history(
        user_id=user_id, occasion=occasion, style=style,
        weather=body.weather.model_dump() if body.weather else None,
        selected=selected, gemini_used=not result.fallback,
        fallback_used=result.fallback, request_id=request_id,
        candidate_count=len(candidate_set.candidates), pipeline_duration_ms=round(t_total, 2),
        user_token=token,
    ))
    _HISTORY_TASKS.add(history_task)
    history_task.add_done_callback(_HISTORY_TASKS.discard)

    return OutfitGenerationResponse(
        success=True, outfit=outfit_dict,
        score=ScoreResponse(overall=round(selected.score * 100, 1), breakdown=breakdown),
        stylist=StylistResponse(reason=result.reason, tips=list(result.styling_tips), confidence=result.confidence),
        metadata=MetadataResponse(
            generated_at=generated_at, request_id=request_id,
            used_gemini=not result.fallback, fallback_used=result.fallback,
            generation_time_ms=round(t_total, 2),
            wardrobe_items_count=len(wardrobe), candidates_generated=candidate_set.total_combinations_scored,
            slots_missing=list(candidate_set.slots_missing),
        ),
    )


# ── POST /outfits/wear ──


def _insert_generated_outfit_stub(client: Client, user_id: str, request_id: str) -> Optional[str]:
    """Helper to insert a minimal generated_outfits row for a request_id and return its UUID."""
    try:
        res = client.table("generated_outfits").insert({
            "user_id": user_id,
            "request_id": request_id,
        }).execute()
        if res and res.data:
            return res.data[0]["id"]
    except Exception as exc:
        logger.warning("Failed to insert stub generated_outfit for request_id %s: %s", request_id, exc)
    return None


@router.post("/outfits/wear", status_code=status.HTTP_204_NO_CONTENT)
async def wear_outfit_today(
    body: WearOutfitRequest,
    user_id: str = Depends(get_current_user),
    user_client: Client = Depends(get_user_supabase),
) -> None:
    """Mark an outfit as worn today (RLS-enforced via user-scoped client).

    Upserts: replaces the previous entry for the same date.
    """
    outfit_id = body.outfit_id

    # Best-effort: resolve request_id → DB row id. History persistence is
    # fire-and-forget, so a freshly generated outfit may not have landed yet.
    try:
        resolved = await asyncio.to_thread(
            lambda: user_client.table("generated_outfits")
            .select("id")
            .eq("request_id", outfit_id)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .maybe_single()
            .execute()
        )
        if resolved and resolved.data:
            outfit_id = resolved.data["id"]
    except Exception as exc:
        logger.warning(
            "generated_outfits lookup failed (table may not exist yet); "
            "using raw outfit_id as fallback: %s", exc
        )

    try:
        uuid.UUID(outfit_id)
    except ValueError:
        # Not a valid UUID: auto-persist a row to generated_outfits so we get a UUID FK
        new_id = await asyncio.to_thread(
            lambda: _insert_generated_outfit_stub(user_client, user_id, body.outfit_id)
        )
        if new_id:
            outfit_id = new_id

    try:
        uuid.UUID(outfit_id)
    except ValueError:
        # A request_id whose history row hasn't been persisted yet must not
        # be inserted into the UUID FK column — ask the client to retry.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Outfit is still being saved — retry in a moment",
        )

    target_date = body.date or body.worn_date or datetime.now(timezone.utc).date().isoformat()
    try:
        await asyncio.to_thread(
            lambda: user_client.table("wear_history").upsert({
                "user_id": user_id,
                "outfit_id": outfit_id,
                "worn_date": target_date,
            }, on_conflict="user_id,worn_date").execute()
        )
    except Exception as exc:
        logger.error("wear_history upsert failed: %s", exc)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to record wear")


@router.delete("/outfits/wear", status_code=status.HTTP_204_NO_CONTENT)
async def delete_worn_outfit_today(
    user_id: str = Depends(get_current_user),
    user_client: Client = Depends(get_user_supabase),
) -> None:
    """Delete today's worn outfit record from wear_history and generated_outfits."""
    today = datetime.now(timezone.utc).date().isoformat()
    try:
        # 1. Delete from wear_history
        await asyncio.to_thread(
            lambda: user_client.table("wear_history").delete()
            .eq("user_id", user_id)
            .eq("worn_date", today)
            .execute()
        )
        # 2. Delete today's stubs/entries from generated_outfits
        today_start = f"{today}T00:00:00+00:00"
        today_end = f"{today}T23:59:59+00:00"
        await asyncio.to_thread(
            lambda: user_client.table("generated_outfits").delete()
            .eq("user_id", user_id)
            .gte("created_at", today_start)
            .lte("created_at", today_end)
            .execute()
        )
    except Exception as exc:
        logger.error("wear_history / generated_outfits delete failed: %s", exc)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to delete wear record")


# ── GET /outfits/history ──



@router.get("/outfits/history", response_model=OutfitHistoryResponse)
async def get_outfit_history(
    user_id: str = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    user_client: Client = Depends(get_user_supabase),
) -> OutfitHistoryResponse:
    """Paginated outfit generation history (RLS-enforced via user-scoped client)."""
    offset = (page - 1) * page_size

    def _fetch_page():
        count_resp = (
            user_client.table("generated_outfits")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total = count_resp.count if hasattr(count_resp, "count") and count_resp.count else 0

        resp = (
            user_client.table("generated_outfits")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        return total, resp

    try:
        total, resp = await asyncio.to_thread(_fetch_page)
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to fetch history")

    rows = resp.data or []
    if not rows:
        return OutfitHistoryResponse(outfits=[], total=total, page=page, page_size=page_size)

    all_outfit_ids = [row["id"] for row in rows]
    items_by_outfit: dict[str, list[OutfitItemResponse]] = defaultdict(list)
    try:
        items_resp = await asyncio.to_thread(
            lambda: user_client.table("generated_outfit_items")
            .select("outfit_id, clothing_item_id, slot")
            .in_("outfit_id", all_outfit_ids)
            .execute()
        )
        for ir in items_resp.data or []:
            items_by_outfit[ir["outfit_id"]].append(
                OutfitItemResponse(id=ir["clothing_item_id"], attributes={})
            )
    except Exception as exc:
        logger.warning("Could not fetch generated_outfit_items: %s", exc)

    outfits: list[OutfitHistoryItem] = []
    for row in rows:
        outfits.append(OutfitHistoryItem(
            id=row["id"],
            occasion=row.get("occasion"),
            style=row.get("style"),
            weather=row.get("weather"),
            overall_score=row.get("overall_score") or row.get("score"),
            gemini_used=row.get("gemini_used", False),
            fallback_used=row.get("fallback_used", False),
            created_at=row["created_at"],
            items=items_by_outfit.get(row["id"], []),
        ))

    return OutfitHistoryResponse(outfits=outfits, total=total, page=page, page_size=page_size)


# ── GET /outfits/worn ──


@router.get("/outfits/worn", response_model=OutfitHistoryResponse)
async def get_worn_outfits(
    user_id: str = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    user_client: Client = Depends(get_user_supabase),
) -> OutfitHistoryResponse:
    """Paginated wear history (RLS-enforced via user-scoped client)."""
    offset = (page - 1) * page_size

    def _fetch_page():
        count_resp = (
            user_client.table("wear_history")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total = count_resp.count if hasattr(count_resp, "count") and count_resp.count else 0

        resp = (
            user_client.table("wear_history")
            .select("outfit_id, worn_date, created_at")
            .eq("user_id", user_id)
            .order("worn_date", desc=True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        return total, resp

    try:
        total, resp = await asyncio.to_thread(_fetch_page)
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to fetch wear history")

    wear_rows = resp.data or []
    if not wear_rows:
        return OutfitHistoryResponse(outfits=[], total=total, page=page, page_size=page_size)

    all_outfit_ids = list({row["outfit_id"] for row in wear_rows})
    try:
        out_resp = await asyncio.to_thread(
            lambda: user_client.table("generated_outfits")
            .select("*")
            .in_("id", all_outfit_ids)
            .execute()
        )
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to fetch outfit details")

    outfits_by_id: dict[str, dict] = {row["id"]: row for row in out_resp.data or []}

    items_by_outfit: dict[str, list[OutfitItemResponse]] = defaultdict(list)
    try:
        items_resp = await asyncio.to_thread(
            lambda: user_client.table("generated_outfit_items")
            .select("outfit_id, clothing_item_id, slot")
            .in_("outfit_id", all_outfit_ids)
            .execute()
        )
        for ir in items_resp.data or []:
            items_by_outfit[ir["outfit_id"]].append(
                OutfitItemResponse(id=ir["clothing_item_id"], attributes={})
            )
    except Exception as exc:
        logger.warning("Could not fetch generated_outfit_items for worn outfits: %s", exc)

    outfits: list[OutfitHistoryItem] = []
    for row in wear_rows:
        oid = row["outfit_id"]
        out_row = outfits_by_id.get(oid, {})
        outfits.append(OutfitHistoryItem(
            id=str(oid),
            occasion=out_row.get("occasion"),
            style=out_row.get("style"),
            weather=out_row.get("weather"),
            overall_score=out_row.get("overall_score"),
            gemini_used=out_row.get("gemini_used", False),
            fallback_used=out_row.get("fallback_used", False),
            created_at=out_row.get("created_at", row["created_at"]),
            items=items_by_outfit.get(oid, []),
        ))

    return OutfitHistoryResponse(outfits=outfits, total=total, page=page, page_size=page_size)


# ── GET /outfits/calendar ──


@router.get("/outfits/calendar")
async def get_outfit_calendar(
    start_date: Optional[str] = Query(default=None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(default=None, description="YYYY-MM-DD"),
    user_id: str = Depends(get_current_user),
    user_client: Client = Depends(get_user_supabase),
) -> list[dict]:
    """Returns dates in the range with boolean indicating if an outfit exists/was worn."""
    dates_with_outfits: set[str] = set()

    # Query wear_history
    try:
        query = user_client.table("wear_history").select("worn_date").eq("user_id", user_id)
        if start_date:
            query = query.gte("worn_date", start_date)
        if end_date:
            query = query.lte("worn_date", end_date)
        resp = await asyncio.to_thread(query.execute)
        for row in resp.data or []:
            if row.get("worn_date"):
                dates_with_outfits.add(str(row["worn_date"]))
    except Exception as exc:
        logger.warning("Failed querying wear_history for calendar: %s", exc)

    return [{"date": d, "has_outfit": True} for d in sorted(dates_with_outfits)]


# ── Shared helpers ──


async def _save_outfit_history(**kwargs) -> None:
    from app.api.outfits import save_outfit_history

    token = kwargs.pop("user_token", "")
    await asyncio.to_thread(save_outfit_history, user_token=token, **kwargs)
