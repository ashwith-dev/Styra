"""Outfit generation API — thin orchestration layer.

Routes requests to the AI pipeline without containing any
recommendation logic. The intelligence lives in ``RankingEngine``
and ``GeminiStylist``.
"""

import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from supabase import Client

from app.dependencies import get_current_user
from app.models.api_contract import (
    OutfitGenerationRequest,
    OutfitGenerationResponse,
    OutfitItemResponse,
    ScoreBreakdownItem,
    ScoreResponse,
    StylistResponse,
    MetadataResponse,
)
from app.ai.engine.filter_engine import FilterEngine, FilterContext
from app.ai.engine.ranking_engine import RankingEngine
from app.ai.engine.scoring_config import RECENT_OUTFIT_EXCLUDE_COUNT, STYLIST_TIMEOUT_SECONDS
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.gemini_stylist import (
    GeminiStylist,
    StylistResult,
    weighted_sample_top_k,
)
from app.ai.repositories.supabase_wardrobe_repository import SupabaseWardrobeRepository
from app.services.supabase_client import get_supabase
from app.utils.jwt import get_token, get_user_supabase

logger = logging.getLogger(__name__)

router = APIRouter()

# Strong references to in-flight history-persistence tasks so they can't
# be garbage-collected mid-run (fire-and-forget, but never silently lost).
_HISTORY_TASKS: set[asyncio.Task] = set()

_FilterEngine: Optional[FilterEngine] = None


def _get_filter_engine() -> FilterEngine:
    global _FilterEngine
    if _FilterEngine is None:
        _FilterEngine = FilterEngine()
    return _FilterEngine


_VALID_OCCASIONS = {
    "casual", "formal", "office", "college", "party", "wedding",
    "travel", "gym", "home", "date", "festive", "business_casual",
    "smart_casual", "date_night",
}

_VALID_STYLES = {
    "casual", "formal", "sporty", "bohemian", "minimalist",
    "vintage", "edgy", "preppy", "romantic", "athleisure", "streetwear",
}

_VALID_CONDITIONS = {"sunny", "cloudy", "rainy", "snowy", "windy", "foggy", "clear", "hot"}

# Maps human-readable WMO condition strings (sent by the mobile app) to the
# canonical backend condition values.  The mobile WMO_CODE_MAP produces
# multi-word strings like "Clear Sky" or "Light Rain" that the strict
# _VALID_CONDITIONS set does not accept — so we normalise before validating.
_CONDITION_ALIAS_MAP: dict[str, str] = {
    # Clear / Sunny
    "clear sky":          "clear",
    "mainly clear":       "clear",
    "clear":              "clear",
    "sunny":              "sunny",
    # Cloudy
    "partly cloudy":      "cloudy",
    "overcast":           "cloudy",
    "cloudy":             "cloudy",
    # Foggy
    "foggy":              "foggy",
    "fog":                "foggy",
    # Rain / Drizzle
    "drizzle":            "rainy",
    "light drizzle":      "rainy",
    "heavy drizzle":      "rainy",
    "freezing drizzle":   "rainy",
    "light rain":         "rainy",
    "rainy":              "rainy",
    "rain":               "rainy",
    "heavy rain":         "rainy",
    "freezing rain":      "rainy",
    "light showers":      "rainy",
    "heavy showers":      "rainy",
    "showers":            "rainy",
    # Snow
    "light snow":         "snowy",
    "snowy":              "snowy",
    "snow":               "snowy",
    "heavy snow":         "snowy",
    "snow grains":        "snowy",
    "snow showers":       "snowy",
    # Thunderstorm
    "thunderstorm":       "rainy",
    # Windy
    "windy":              "windy",
    # Hot
    "hot":                "hot",
    # Cool / Cold — mobile manual weather presets
    "cool":               "cloudy",
    "cold":               "snowy",
    # Unknown / fallback — ignored, treat as no condition
    "unknown":            "",
}


def _normalize_condition(condition: Optional[str]) -> Optional[str]:
    """Map any weather condition string to a valid backend condition.

    Accepts canonical values (clear, cloudy, …) as well as human-readable
    WMO strings produced by the mobile app (Clear Sky, Partly Cloudy, …).
    Returns None when the string cannot be mapped so callers can skip it.
    """
    if not condition:
        return None
    norm = condition.strip().lower()
    # Already a valid canonical value
    if norm in _VALID_CONDITIONS:
        return norm
    # Explicit alias-map membership — an empty-string alias ("unknown")
    # means "no usable condition", which is valid and must be skipped,
    # not treated as unrecognised.
    if norm in _CONDITION_ALIAS_MAP:
        return _CONDITION_ALIAS_MAP[norm] or None
    # Prefix match — e.g. "light rain showers" → "rainy"
    for alias, canonical in _CONDITION_ALIAS_MAP.items():
        if norm.startswith(alias) or alias.startswith(norm):
            return canonical or None
    return None

_MAX_EXCLUDED_IDS = 100


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


def _condition_to_temperature(condition: Optional[str]) -> Optional[str]:
    if not condition:
        return None
    cond = condition.strip().lower()
    if cond in ("sunny", "clear", "hot"):
        return "warm"
    elif cond in ("cloudy", "windy"):
        return "mild"
    elif cond in ("rainy", "foggy"):
        return "cool"
    elif cond == "snowy":
        return "cold"
    return None


def _season_for_date() -> str:
    month = datetime.now(timezone.utc).month
    if 3 <= month <= 5:
        return "spring"
    elif 6 <= month <= 8:
        return "summer"
    elif 9 <= month <= 11:
        return "fall"
    return "winter"


def _attr_value(attrs: dict, key: str) -> Optional[str]:
    val = attrs.get(key)
    if isinstance(val, dict):
        val = val.get("value")
    if isinstance(val, str) and val.strip():
        return val.strip()
    return None


def _fetch_recent_outfit_item_sets(
    client: Client,
    user_id: str,
) -> Optional[list[frozenset[str]]]:
    """Batch-fetch the item-ID sets of the user's most recent outfits.

    Two queries total (recent outfits, then their items), grouped in
    memory. Returns ``None`` when there is no usable history or when
    the outfit history tables haven't been created yet.
    """
    try:
        outfits_resp = (
            client.table("generated_outfits")
            .select("id")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(RECENT_OUTFIT_EXCLUDE_COUNT)
            .execute()
        )
    except Exception as exc:
        err_str = str(exc)
        if "PGRST205" in err_str or "schema cache" in err_str or "generated_outfits" in err_str:
            return None  # Table not yet created — silently skip diversity filter
        raise

    outfit_ids = [row["id"] for row in (outfits_resp.data or [])]
    if not outfit_ids:
        return None

    try:
        items_resp = (
            client.table("generated_outfit_items")
            .select("outfit_id, clothing_item_id")
            .in_("outfit_id", outfit_ids)
            .execute()
        )
    except Exception as exc:
        err_str = str(exc)
        if "PGRST205" in err_str or "schema cache" in err_str:
            return None
        raise

    by_outfit: dict[str, set[str]] = {}
    for row in items_resp.data or []:
        by_outfit.setdefault(row["outfit_id"], set()).add(row["clothing_item_id"])

    item_sets = [frozenset(ids) for ids in by_outfit.values() if ids]
    return item_sets or None


@router.post("/outfits/generate", response_model=OutfitGenerationResponse)
async def generate_outfit(
    body: OutfitGenerationRequest,
    request: Request,
    user_id: str = Depends(get_current_user),
    user_client: Client = Depends(get_user_supabase),
    token: str = Depends(get_token),
) -> OutfitGenerationResponse:
    """Generate an AI-powered outfit recommendation.

    Orchestrates wardrobe fetch → ranking → Gemini stylist selection.
    No recommendation logic lives in this handler.
    """
    # Reuse the correlation ID from middleware so metadata.request_id
    # matches the X-Request-ID response header and every log line.
    request_id = getattr(request.state, "correlation_id", None) or uuid.uuid4().hex[:12]
    t_start = time.monotonic()

    # ── Validate inputs ──
    if body.occasion and body.occasion.strip().lower() not in _VALID_OCCASIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid occasion. Must be one of: {', '.join(sorted(_VALID_OCCASIONS))}",
        )
    if body.style and body.style.strip().lower() not in _VALID_STYLES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid style. Must be one of: {', '.join(sorted(_VALID_STYLES))}",
        )

    # Normalise weather condition before validation so that human-readable
    # WMO strings from the mobile app (e.g. "Clear Sky") are accepted.
    normalized_condition: Optional[str] = None
    if body.weather and body.weather.condition:
        normalized_condition = _normalize_condition(body.weather.condition)
        raw_condition = body.weather.condition.strip().lower()
        if (
            raw_condition not in _VALID_CONDITIONS
            and raw_condition not in _CONDITION_ALIAS_MAP
            and normalized_condition is None
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid weather condition. Must be one of: {', '.join(sorted(_VALID_CONDITIONS))}",
            )

    if len(body.excluded_item_ids) > _MAX_EXCLUDED_IDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Maximum {_MAX_EXCLUDED_IDS} excluded item IDs allowed",
        )

    # ── Determine temperature level ──
    temperature_level: Optional[str] = None
    if normalized_condition:
        temp_from_cond = _condition_to_temperature(normalized_condition)
        temperature_level = temp_from_cond
    if body.weather and body.weather.temperature is not None:
        temperature_level = _temperature_to_level(body.weather.temperature)

    occasion = body.occasion.strip().lower() if body.occasion else None
    style = body.style.strip().lower() if body.style else None

    # ── Fetch wardrobe + recent outfit history in parallel ──
    # (history fetch is best-effort: any error just disables diversity)
    repo = SupabaseWardrobeRepository(user_client)
    wardrobe_result, recent_result = await asyncio.gather(
        asyncio.to_thread(repo.fetch_all_for_user, user_id),
        asyncio.to_thread(_fetch_recent_outfit_item_sets, user_client, user_id),
        return_exceptions=True,
    )

    if isinstance(wardrobe_result, Exception):
        logger.error("Failed to fetch wardrobe for user %s: %s", user_id, wardrobe_result)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve wardrobe",
        )
    wardrobe = wardrobe_result

    recent_outfits: Optional[list[frozenset[str]]] = None
    if isinstance(recent_result, Exception):
        logger.debug(
            "Skipping diversity filter for user %s: %s",
            user_id, recent_result,
        )
    else:
        recent_outfits = recent_result

    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No clothing items in your wardrobe. Upload items first.",
        )

    # ── Build filter context ──
    context = FilterContext(
        season=_season_for_date(),
        occasion=occasion,
        temperature=temperature_level,
        outfit_category=occasion or "casual",
        excluded_item_ids=body.excluded_item_ids,
    )

    # ── Rank candidates ──
    filter_engine = _get_filter_engine()
    ranking = RankingEngine(filter_engine)

    try:
        candidate_set = await asyncio.to_thread(
            ranking.generate_candidates,
            wardrobe,
            context,
            top_n=5,
            recent_outfits=recent_outfits,
        )
    except Exception as exc:
        logger.error("Ranking failed for user %s: %s", user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate outfit candidates",
        )

    if not candidate_set.candidates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No valid outfit combinations could be generated from your wardrobe. Try adding more items.",
        )

    # ── Gemini stylist selection ──
    gemini = GeminiProvider()
    stylist = GeminiStylist(gemini)

    try:
        result = await asyncio.wait_for(
            stylist.select(
                candidate_set,
                context,
                style_preference=style,
            ),
            timeout=STYLIST_TIMEOUT_SECONDS,
        )
    except Exception as exc:
        logger.warning("Stylist selection failed for user %s; sampling from top candidates: %s", user_id, exc)
        best = weighted_sample_top_k(candidate_set.candidates)
        result = StylistResult(
            selected=best,
            confidence=best.score,
            reason=f"AI stylist unavailable; used a top-ranked outfit (score {best.score:.2f}).",
            fallback=True,
            fallback_reason="AI stylist unavailable",
            stylist_duration_ms=0.0,
        )

    selected = result.selected

    # ── Build outfit response ──
    outfit_items: dict = {}
    for item in selected.items:
        slot = item.category or "unknown"
        attrs = item.attributes or {}
        entry = OutfitItemResponse(
            id=item.id,
            category=item.category,
            type=_attr_value(attrs, "type"),
            color=item.color,
            attributes=attrs,
            thumbnail_url=item.thumbnail_url,
            image_url=item.original_image_url,
        )
        if slot in ("top", "bottom", "footwear", "outerwear", "dress"):
            outfit_items[slot] = entry.model_dump()
        elif slot == "accessory":
            if "accessories" not in outfit_items:
                outfit_items["accessories"] = []
            outfit_items["accessories"].append(entry.model_dump())

    score_breakdown = [
        ScoreBreakdownItem(
            dimension=c.dimension,
            score=c.raw_score,
            weight=c.weight,
            weighted_score=c.weighted_score,
        )
        for c in selected.score_breakdown
    ]

    t_total = (time.monotonic() - t_start) * 1000

    # ── Persist history (best-effort, off the event loop) ──
    history_task = asyncio.create_task(asyncio.to_thread(
        save_outfit_history,
        user_id=user_id,
        occasion=occasion,
        style=style,
        weather=body.weather.model_dump() if body.weather else None,
        selected=selected,
        gemini_used=not result.fallback,
        fallback_used=result.fallback,
        gemini_reason=result.reason if not result.fallback else None,
        request_id=request_id,
        candidate_count=len(candidate_set.candidates),
        pipeline_duration_ms=round(t_total, 2),
        user_token=token,
    ))
    _HISTORY_TASKS.add(history_task)
    history_task.add_done_callback(_HISTORY_TASKS.discard)

    generated_at = datetime.now(timezone.utc).isoformat()

    logger.info(
        "Outfit generated for user=%s request=%s: %d candidates, "
        "gemini=%s, fallback=%s, %.1fms",
        user_id, request_id,
        len(candidate_set.candidates),
        not result.fallback,
        result.fallback,
        t_total,
    )

    return OutfitGenerationResponse(
        success=True,
        outfit=outfit_items,
        score=ScoreResponse(
            overall=round(selected.score * 100, 1),
            breakdown=score_breakdown,
        ),
        stylist=StylistResponse(
            reason=result.reason,
            tips=list(result.styling_tips),
            confidence=result.confidence,
        ),
        metadata=MetadataResponse(
            generated_at=generated_at,
            request_id=request_id,
            used_gemini=not result.fallback,
            fallback_used=result.fallback,
            generation_time_ms=round(t_total, 2),
            wardrobe_items_count=len(wardrobe),
            candidates_generated=candidate_set.total_combinations_scored,
            slots_missing=list(candidate_set.slots_missing),
        ),
    )


def save_outfit_history(
    *,
    user_id: str,
    occasion: Optional[str],
    style: Optional[str],
    weather: Optional[dict],
    selected,
    gemini_used: bool,
    fallback_used: bool,
    request_id: str,
    candidate_count: int,
    pipeline_duration_ms: float,
    gemini_reason: Optional[str] = None,
    user_token: str = "",
) -> None:
    """Insert the generated outfit + its items (best-effort).

    Synchronous — the Supabase client is blocking, so callers must run
    this via ``asyncio.to_thread`` to keep it off the event loop.
    """
    try:
        if user_token:
            from app.services.supabase_client import get_user_client
            client = get_user_client(user_token)
        else:
            client = get_supabase()

        payload = {
            "user_id": user_id,
            "occasion": occasion,
            "style": style,
            "weather": weather,
            # Stored on the same 0–100 scale the generate response uses
            # so history/worn endpoints stay consistent with the client.
            "overall_score": round(selected.score * 100, 1),
            "gemini_reason": gemini_reason,
            "gemini_used": gemini_used,
            "fallback_used": fallback_used,
            "request_id": request_id,
            "candidate_count": candidate_count,
            "pipeline_duration_ms": pipeline_duration_ms,
        }

        outfit_resp = None
        try:
            outfit_resp = client.table("generated_outfits").insert(payload).execute()
        except Exception as exc:
            err_str = str(exc)
            if "PGRST204" in err_str or "column" in err_str or "schema cache" in err_str:
                logger.info("Retrying generated_outfits insert with compatible base schema payload: %s", exc)
                base_payload = {
                    "user_id": user_id,
                    "request_id": request_id,
                    "occasion": occasion,
                    "style": style,
                    "score": round(selected.score * 100, 1),
                    "gemini_used": gemini_used,
                }
                outfit_resp = client.table("generated_outfits").insert(base_payload).execute()
            else:
                raise

        if outfit_resp and outfit_resp.data:
            outfit_row_id = outfit_resp.data[0]["id"]
            item_rows: list[dict] = []
            for item in selected.items:
                slot = (item.category or "unknown")
                item_rows.append({
                    "outfit_id": outfit_row_id,
                    "clothing_item_id": item.id,
                    "slot": slot,
                })

            if item_rows:
                try:
                    client.table("generated_outfit_items").insert(item_rows).execute()
                except Exception as item_exc:
                    logger.warning("generated_outfit_items insert skipped: %s", item_exc)

    except Exception as exc:
        err_str = str(exc)
        if "PGRST205" in err_str or "schema cache" in err_str:
            logger.debug("Outfit history table not yet created; skipping save for user %s", user_id)
        else:
            logger.warning("Failed to save outfit history for user %s: %s", user_id, exc)
