"""Ranking engine — top-level pipeline orchestrator.

Wires together the full candidate selection → combination building →
scoring → ranking pipeline. This is the single entry point that future
API routes will call.
"""

import logging
import random
import time
from typing import Iterable, Optional

from app.ai.models.candidate import CandidateItem
from app.ai.models.outfit_candidate import CandidateSet, OutfitCandidate
from app.ai.engine.filter_engine import FilterEngine, FilterContext
from app.ai.engine.candidate_selector import CandidateSelector
from app.ai.engine.outfit_builder import OutfitBuilder
from app.ai.engine.outfit_scorer import OutfitScorer
from app.ai.engine.scoring_config import DEFAULT_TOP_N, MAX_TOP_N, MIN_SAMPLE_WEIGHT

logger = logging.getLogger(__name__)


def _item_id_set(candidate: OutfitCandidate) -> frozenset[str]:
    """Return the set of wardrobe item IDs making up a candidate outfit."""
    return frozenset(item.id for item in candidate.items)


def weighted_sample_top_n(
    ranked: list[OutfitCandidate],
    top_n: int,
    rng: random.Random,
) -> list[OutfitCandidate]:
    """Pick *top_n* candidates by score-weighted sampling without replacement.

    The pool is the top ``max(top_n * 4, 10)`` ranked candidates, so quality
    is preserved while identical requests still surface varied selections
    (a pure deterministic sort would repeat the same top-N every time).
    """
    pool = list(ranked[: max(top_n * 4, 10)])
    chosen: list[OutfitCandidate] = []
    while pool and len(chosen) < top_n:
        weights = [max(c.score, MIN_SAMPLE_WEIGHT) for c in pool]
        idx = rng.choices(range(len(pool)), weights=weights, k=1)[0]
        chosen.append(pool.pop(idx))
    return chosen


def split_fresh_vs_recent(
    candidates: list[OutfitCandidate],
    recent_outfits: Iterable[frozenset[str]],
) -> tuple[list[OutfitCandidate], list[OutfitCandidate]]:
    """Split candidates into fresh combinations vs. recent-outfit repeats.

    Score order is preserved within each group. When *every* candidate is
    a repeat the split is a no-op (all fresh, no repeats) so a small
    wardrobe never yields an empty result just because everything was
    generated recently.
    """
    recent = set(recent_outfits)
    if not recent:
        return candidates, []
    fresh = [c for c in candidates if _item_id_set(c) not in recent]
    if not fresh:
        return candidates, []
    repeats = [c for c in candidates if _item_id_set(c) in recent]
    if repeats:
        logger.info(
            "Deprioritised %d candidate(s) matching recent outfits", len(repeats)
        )
    return fresh, repeats


class RankingEngine:
    """Orchestrate the full candidate selection and ranking pipeline.

    This engine:
    1. Runs the ``CandidateSelector`` (filter + partition + similarity).
    2. Builds valid outfit combinations via ``OutfitBuilder``.
    3. Scores every candidate via ``OutfitScorer``.
    4. Ranks by score and returns the top N.
    """

    def __init__(
        self,
        filter_engine: FilterEngine,
        vector_service: object | None = None,
        embedding_provider: object | None = None,
    ) -> None:
        """Initialise with concrete engine instances.

        Args:
            filter_engine: Configured ``FilterEngine``.
            vector_service: Optional ``VectorService`` for similarity.
            embedding_provider: Optional ``EmbeddingProvider``.
        """
        self._filter = filter_engine
        self._selector = CandidateSelector(filter_engine, vector_service)
        self._builder = OutfitBuilder()
        self._scorer = OutfitScorer(filter_engine)
        self._vector = vector_service
        self._embedding = embedding_provider

    def generate_candidates(
        self,
        wardrobe: list[CandidateItem],
        context: FilterContext,
        *,
        top_n: int = DEFAULT_TOP_N,
        recent_outfits: Optional[list[frozenset[str]]] = None,
        rng: Optional[random.Random] = None,
    ) -> CandidateSet:
        """Run the full pipeline and return ranked outfit candidates.

        Args:
            wardrobe: Full user wardrobe as ``CandidateItem`` list.
            context: Filter parameters.
            top_n: Number of top candidates to return.
            recent_outfits: Item-ID sets of recently generated outfits.
                Candidates identical to one of these are deprioritised
                below fresh combinations so consecutive requests yield
                distinct looks.
            rng: Randomness source for top-N sampling (injectable for
                deterministic tests; defaults to the module RNG).

        Returns:
            ``CandidateSet`` with ranked outfit candidates and metadata.
        """
        start = time.monotonic()
        top_n = min(max(top_n, 1), MAX_TOP_N)

        # 1. Filter and partition.
        filter_result = self._selector.select(wardrobe, context)

        partitioned = filter_result.partitioned
        if not partitioned.get("top") and not partitioned.get("dress"):
            return CandidateSet()

        if not partitioned.get("bottom") and not partitioned.get("dress"):
            return CandidateSet()

        # 2. Enrich with similarity if possible.
        query_emb = self._build_query_embedding(context)
        if query_emb and self._vector:
            partitioned = self._selector.enrich_with_similarity(
                partitioned, query_emb,
            )

        # 3. Build outfit combinations.
        outfit_category = context.outfit_category or "casual"
        combinations = self._builder.build(
            partitioned,
            outfit_category,
        )

        total_generated = len(combinations)

        if not combinations:
            return CandidateSet(total_combinations_generated=0)

        # 4. Score every combination.
        candidates = [
            self._scorer.score(combo, context)
            for combo in combinations
        ]

        # 5. Rank by score descending.
        candidates.sort(key=lambda c: c.score, reverse=True)

        # 6. Split out repeats of recently generated outfits: fresh
        # combinations are sampled first and repeats only backfill when
        # there aren't enough fresh ones.
        fresh: list[OutfitCandidate] = candidates
        repeats: list[OutfitCandidate] = []
        if recent_outfits:
            fresh, repeats = split_fresh_vs_recent(candidates, recent_outfits)

        # 7. Sample top N (score-weighted, without replacement) so
        # regenerations with identical inputs still produce variety.
        top = weighted_sample_top_n(fresh, top_n, rng or random)
        if len(top) < top_n and repeats:
            top.extend(repeats[: top_n - len(top)])

        duration = (time.monotonic() - start) * 1000

        logger.info(
            "Ranking pipeline: %d items → %d combos → %d scored → %d returned (%.1fms)",
            filter_result.total_input,
            total_generated,
            len(candidates),
            len(top),
            duration,
        )

        slots_missing: list[str] = []
        if not partitioned.get("footwear"):
            slots_missing.append("footwear")

        return CandidateSet(
            candidates=top,
            total_combinations_generated=total_generated,
            total_combinations_scored=len(candidates),
            pipeline_duration_ms=round(duration, 2),
            slots_missing=slots_missing,
        )

    def _build_query_embedding(
        self,
        context: FilterContext,
    ) -> Optional[list[float]]:
        """Build a query embedding from context preferences.

        Combines season, occasion, and style preference into a single
        semantic query that the embedding model can vectorize.
        """
        if self._embedding is None:
            return None

        parts: list[str] = []
        if context.season:
            parts.append(context.season)
        if context.occasion:
            parts.append(context.occasion)
        if context.outfit_category:
            parts.append(context.outfit_category)

        if not parts:
            return None

        query_text = " ".join(parts)
        try:
            return self._embedding.generate_embedding(query_text)
        except Exception:
            logger.warning("Failed to build query embedding", exc_info=True)
            return None
