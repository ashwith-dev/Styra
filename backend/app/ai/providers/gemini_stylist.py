"""Gemini Stylist — final outfit selector.

Wires the RankingEngine output into Gemini for final selection.
Gemini is the stylist, NOT the recommendation engine. It only
picks ONE outfit from the top candidates and explains the choice.

Includes automatic fallback: if Gemini is unavailable, picks one of the
top-scored candidates by score-weighted random sampling, so repeated
requests still yield varied outfits.
"""

import logging
import random
import time
from typing import Optional

from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.gemini_validator import GeminiResponseValidator
from app.ai.prompts.outfit_selection import (
    build_selection_system_prompt,
    build_selection_user_prompt,
)
from app.ai.models.outfit_candidate import CandidateSet, OutfitCandidate
from app.ai.engine.filter_engine import FilterContext
from app.ai.engine.scoring_config import FALLBACK_SAMPLE_TOP_K, MIN_SAMPLE_WEIGHT

logger = logging.getLogger(__name__)


def weighted_sample_top_k(
    candidates: list[OutfitCandidate],
    k: int = FALLBACK_SAMPLE_TOP_K,
    rng: Optional[random.Random] = None,
) -> OutfitCandidate:
    """Pick one candidate from the top ``k`` by score-weighted sampling.

    Higher-scored candidates are more likely to be picked, but every
    candidate in the pool keeps a non-zero chance (weights are floored
    at ``MIN_SAMPLE_WEIGHT``), so consecutive calls can return different
    outfits. ``candidates`` must be sorted by score descending.

    Args:
        candidates: Ranked candidates (non-empty).
        k: Size of the top pool to sample from.
        rng: Optional ``random.Random`` instance for deterministic tests.

    Returns:
        The sampled ``OutfitCandidate``.
    """
    pool = candidates[: max(1, k)]
    weights = [max(c.score, MIN_SAMPLE_WEIGHT) for c in pool]
    chooser = rng if rng is not None else random
    return chooser.choices(pool, weights=weights, k=1)[0]


class StylistResult:
    """The final result from the Gemini stylist."""

    def __init__(
        self,
        selected: OutfitCandidate,
        confidence: float,
        reason: str,
        styling_tips: Optional[list[str]] = None,
        *,
        fallback: bool = False,
        fallback_reason: Optional[str] = None,
        stylist_duration_ms: float = 0.0,
    ) -> None:
        self.selected = selected
        self.confidence = confidence
        self.reason = reason
        self.styling_tips = styling_tips or []
        self.fallback = fallback
        self.fallback_reason = fallback_reason
        self.stylist_duration_ms = stylist_duration_ms


class GeminiStylist:
    """Select the best outfit from ranked candidates using Gemini.

    Gemini NEVER searches, generates, or modifies outfits. It only
    applies fashion judgment to select from pre-ranked candidates.
    """

    def __init__(
        self,
        provider: GeminiProvider,
        rng: Optional[random.Random] = None,
    ) -> None:
        """Initialise with a Gemini provider.

        Args:
            provider: Configured ``GeminiProvider`` instance.
            rng: Optional ``random.Random`` used for fallback sampling
                (inject a seeded instance in tests).
        """
        self._provider = provider
        self._rng = rng

    async def select(
        self,
        candidates: CandidateSet,
        context: FilterContext,
        *,
        style_preference: Optional[str] = None,
        additional_context: Optional[str] = None,
    ) -> StylistResult:
        """Select the best outfit from the candidate set.

        If the ``GeminiProvider`` isn't configured (no API key) or
        returns an invalid/unparseable response, falls back to a
        score-weighted random sample among the top candidates.

        Args:
            candidates: Top-N ranked ``CandidateSet``.
            context: Filter context with season, occasion, etc.
            style_preference: Optional user style preference.
            additional_context: Any extra context.

        Returns:
            ``StylistResult`` with the selected outfit, reason, and
            styling tips.
        """
        start = time.monotonic()

        if not candidates.candidates:
            return self._empty_fallback(start)

        # Validate we have an API key.
        if not self._provider.is_configured():
            return self._fallback(
                candidates,
                "No Gemini API key configured",
                start,
            )

        system_prompt = build_selection_system_prompt()
        user_prompt = build_selection_user_prompt(
            candidates,
            season=context.season,
            occasion=context.occasion,
            weather=context.temperature,
            style_preference=style_preference,
            additional_context=additional_context,
        )

        # Safety: reject oversized prompts.
        if len(user_prompt) > 32000:
            logger.warning("User prompt too long (%d chars); falling back", len(user_prompt))
            return self._fallback(candidates, "Prompt exceeds size limit", start)

        # Sanitise inputs.
        system_prompt = self._sanitise(system_prompt)
        user_prompt = self._sanitise(user_prompt)

        try:
            response = await self._provider.select_outfit(
                system_prompt,
                user_prompt,
            )
        except Exception as exc:
            logger.warning("Gemini selection failed: %s; falling back", exc)
            return self._fallback(candidates, f"Gemini error: {exc}", start)

        # Validate the response.
        validator = GeminiResponseValidator(candidates)
        error = validator.validate(response)
        if error is not None:
            logger.warning("Gemini response validation failed: %s; falling back", error)
            return self._fallback(candidates, f"Validation failed: {error}", start)

        # Resolve the selected candidate (numeric or UUID ID).
        raw_id = response["selected_candidate_id"]
        resolved_id = validator.resolve_candidate_id(raw_id)
        selected = self._find_candidate(candidates, resolved_id) if resolved_id else None
        if selected is None:
            logger.warning("Selected candidate %s not found; falling back", raw_id)
            return self._fallback(
                candidates,
                f"Selected candidate {raw_id} not in candidate set",
                start,
            )

        duration = (time.monotonic() - start) * 1000

        logger.info(
            "Gemini selected outfit %s (confidence=%.2f) in %.1fms",
            resolved_id,
            response.get("confidence", 0.0),
            duration,
        )

        return StylistResult(
            selected=selected,
            confidence=float(response.get("confidence", 0.0)),
            reason=str(response.get("reason", "")),
            styling_tips=list(response.get("styling_tips", [])),
            stylist_duration_ms=round(duration, 2),
        )

    def _fallback(
        self,
        candidates: CandidateSet,
        reason: str,
        start_time: float,
    ) -> StylistResult:
        """Sample a fallback outfit from the top-scored candidates."""
        pool_size = min(FALLBACK_SAMPLE_TOP_K, len(candidates.candidates))
        best = weighted_sample_top_k(candidates.candidates, rng=self._rng)
        duration = (time.monotonic() - start_time) * 1000
        logger.info(
            "Gemini fallback: sampled %s from top %d candidates (%s)",
            best.outfit_id,
            pool_size,
            reason,
        )

        return StylistResult(
            selected=best,
            confidence=best.score,
            reason=(
                f"Selected from the top {pool_size} scored candidates "
                f"({best.score:.2f}). Stylist unavailable: {reason}"
            ),
            styling_tips=[],
            fallback=True,
            fallback_reason=reason,
            stylist_duration_ms=round(duration, 2),
        )

    def _empty_fallback(self, start_time: float) -> StylistResult:
        """Return an empty result when no candidates exist."""
        duration = (time.monotonic() - start_time) * 1000
        empty = OutfitCandidate(outfit_id="empty", items=[], score=0.0)
        return StylistResult(
            selected=empty,
            confidence=0.0,
            reason="No candidates available for selection.",
            fallback=True,
            fallback_reason="Empty candidate set",
            stylist_duration_ms=round(duration, 2),
        )

    @staticmethod
    def _find_candidate(
        candidates: CandidateSet,
        outfit_id: str,
    ) -> Optional[OutfitCandidate]:
        for c in candidates.candidates:
            if c.outfit_id == outfit_id:
                return c
        return None

    @staticmethod
    def _sanitise(text: str) -> str:
        """Remove control characters from text.

        Note: newlines in user-supplied values are handled by
        ``_sanitise_user_value`` in the prompts module. This method
        handles control characters in the full prompt text.
        """
        return (
            text.replace("\x00", "")
            .replace("\r", "")
        )
