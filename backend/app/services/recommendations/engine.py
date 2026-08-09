"""Recommendation engine — generates scored outfit combinations.

Independent from routes and database logic. Works on in-memory wardrobe data
and returns structured recommendations with deterministic explanations.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Optional

from app.services.recommendations.rules import (
    OUTFIT_CATEGORIES,
    OCCASION_MAP,
    SEASON_WEIGHTS,
    EXPLANATION_TEMPLATES,
    COLOUR_HARMONY_EXPLANATIONS,
    STYLE_EXPLANATIONS,
    SEASON_EXPLANATIONS,
    OCCASION_EXPLANATIONS,
    ColourHarmony,
    StyleCompatibility,
    _attr_value,
    _attr_confidence,
    _canonical_category,
    _list_values,
    _norm,
)

# How many items to consider per slot before generating combinations.
_CANDIDATES_PER_SLOT = 12
# Maximum combinations to score per outfit category.
_MAX_COMBINATIONS = 5000
# Maximum total recommendations returned.
_MAX_RESULTS = 20


@dataclass
class OutfitRecommendation:
    items: list[dict]
    score: float
    explanation: str
    outfit_category: str
    outfit_id: str = ""

    def __post_init__(self) -> None:
        if not self.outfit_id:
            self.outfit_id = "-".join(sorted(i["id"] for i in self.items))


@dataclass
class _ScoredItem:
    item: dict
    pre_score: float


class RecommendationEngine:
    """Generates outfit recommendations from a user's wardrobe."""

    def recommend(
        self,
        wardrobe: list[dict],
        *,
        occasion: Optional[str] = None,
        season: Optional[str] = None,
        max_results: int = _MAX_RESULTS,
    ) -> list[OutfitRecommendation]:
        """Generate recommendations from the wardrobe.

        Args:
            wardrobe: List of clothing items. Each must have ``id``,
                      ``attributes``, and ``status`` at minimum.
            occasion: Optional outfit category filter (casual, formal, etc.).
            season: Optional season filter (spring, summer, fall, winter).
            max_results: Max number of recommendations to return.
        """
        # 1. Filter to completed items with valid categories.
        items = self._filter_usable(wardrobe)
        if not items:
            return []

        # 2. Determine which outfit categories to generate.
        targets = self._target_categories(occasion)
        if not targets:
            return []

        # 3. Partition items by clothing category.
        by_category = self._partition(items)

        # 4. Generate and score combinations for each target outfit category.
        all_recs: list[OutfitRecommendation] = []
        seen_combos: set[frozenset[str]] = set()

        for outfit_cat in targets:
            outfit_recs = self._generate_for_category(
                by_category,
                outfit_cat,
                season=season,
                seen_combos=seen_combos,
            )
            all_recs.extend(outfit_recs)

        # 5. Sort by score descending, deduplicate, return top N.
        all_recs.sort(key=lambda r: r.score, reverse=True)
        return all_recs[:max_results]

    # ── private helpers ──

    @staticmethod
    def _filter_usable(wardrobe: list[dict]) -> list[dict]:
        """Remove items that are not 'completed' or lack a usable category."""
        usable: list[dict] = []
        for item in wardrobe:
            if item.get("status") != "completed":
                continue
            attrs = item.get("attributes") or {}
            raw_cat = _attr_value(attrs, "category")
            if not raw_cat or _norm(raw_cat) == "invalid":
                continue
            if _canonical_category(raw_cat) is None:
                continue
            usable.append(item)
        return usable

    @staticmethod
    def _target_categories(occasion: Optional[str]) -> list[str]:
        if occasion:
            occasion = occasion.strip().lower()
            if occasion in OUTFIT_CATEGORIES:
                return [occasion]
        return list(OUTFIT_CATEGORIES.keys())

    @staticmethod
    def _partition(items: list[dict]) -> dict[str, list[dict]]:
        by_cat: dict[str, list[dict]] = {
            "top": [], "bottom": [], "dress": [],
            "outerwear": [], "footwear": [], "accessory": [],
        }
        for item in items:
            cat = _canonical_category(
                _attr_value(item.get("attributes", {}), "category")
            )
            if cat in by_cat:
                by_cat[cat].append(item)
        return by_cat

    def _generate_for_category(
        self,
        by_category: dict[str, list[dict]],
        outfit_cat: str,
        *,
        season: Optional[str],
        seen_combos: set[frozenset[str]],
    ) -> list[OutfitRecommendation]:
        template = OUTFIT_CATEGORIES[outfit_cat]
        # Template values are booleans, so presence of the key — not its
        # truthiness — decides whether dress combos exist for this category.
        has_dress = "dress" in template

        # Determine which slots are required (not nullable).
        slots: list[str] = []
        for slot_name, nullable in template.items():
            if not nullable:
                slots.append(slot_name)
        if not slots:
            return []

        # If dress is allowed (required or optional), try both dress-based
        # and top/bottom-based combos to maximise coverage.
        if has_dress:
            combos = self._combine(
                by_category, slots, outfit_cat, season, seen_combos,
            )
            # Generate dress-first combos: dress replaces top+bottom.
            dress_slots = [s for s in slots if s not in ("top", "bottom")] + ["dress"]
            dress_combos = self._combine(
                by_category, dress_slots, outfit_cat, season, seen_combos,
            )
            combos.extend(dress_combos)
        else:
            combos = self._combine(
                by_category, slots, outfit_cat, season, seen_combos,
            )

        scored = []
        for items in combos:
            outfit_id = frozenset(i["id"] for i in items)
            if outfit_id in seen_combos:
                continue
            seen_combos.add(outfit_id)

            score = self._score(items, outfit_cat, season)
            explanation = self._explain(items, outfit_cat, season)
            scored.append(OutfitRecommendation(
                items=items,
                score=score,
                explanation=explanation,
                outfit_category=outfit_cat,
            ))

        scored.sort(key=lambda r: r.score, reverse=True)
        return scored[:6]  # Return top 6 per outfit category.

    def _combine(
        self,
        by_category: dict[str, list[dict]],
        slots: list[str],
        outfit_cat: str,
        season: Optional[str],
        seen_combos: set[frozenset[str]],
    ) -> list[list[dict]]:
        """Generate valid combinations across the given slots.

        Pre-scores items for each slot, selects top candidates, and produces
        cartesian-product combinations capped at _MAX_COMBINATIONS.
        """
        candidates: dict[str, list[_ScoredItem]] = {}
        for slot in slots:
            pool = by_category.get(slot, [])
            scored = []
            for item in pool:
                ps = self._item_pre_score(item, outfit_cat, season)
                scored.append(_ScoredItem(item=item, pre_score=ps))
            scored.sort(key=lambda si: si.pre_score, reverse=True)
            candidates[slot] = scored[:_CANDIDATES_PER_SLOT]

        # Build combinations via cartesian product, with early cap.
        result: list[list[dict]] = []
        self._cartesian(
            list(candidates.values()),
            [],
            result,
            _MAX_COMBINATIONS,
            seen_combos,
        )
        return result

    @staticmethod
    def _cartesian(
        pools: list[list[_ScoredItem]],
        current: list[dict],
        result: list[list[dict]],
        cap: int,
        seen: set[frozenset[str]],
    ) -> None:
        if len(result) >= cap:
            return
        if not pools:
            result.append(list(current))
            return
        for si in pools[0]:
            current.append(si.item)
            RecommendationEngine._cartesian(pools[1:], current, result, cap, seen)
            current.pop()
            if len(result) >= cap:
                return

    # ── Scoring ──

    def _item_pre_score(
        self,
        item: dict,
        outfit_cat: str,
        season: Optional[str],
    ) -> float:
        """Quick relevance score for a single item — used to prune candidates."""
        attrs = item.get("attributes", {})
        score = 0.5

        # Occasion fit.
        item_occasions = [_norm(o) for o in _list_values(attrs, "occasion")]
        target_occs = OCCASION_MAP.get(outfit_cat, [])
        if any(o in target_occs for o in item_occasions):
            score += 0.3
        elif not item_occasions:
            score += 0.1  # No data, assume neutral.

        # Season fit.
        if season:
            item_seasons = [_norm(s) for s in _list_values(attrs, "season")]
            if _norm(season) in item_seasons:
                score += 0.2

        return score

    def _score(
        self,
        items: list[dict],
        outfit_cat: str,
        season: Optional[str],
    ) -> float:
        """Compute a 0–100 score for a complete outfit combination."""
        colours = [self._item_colour(i) for i in items]
        styles = [self._item_style(i) for i in items]

        colour_score = ColourHarmony.score(colours) * 20  # 0–20
        style_score = StyleCompatibility.score(styles) * 20  # 0–20
        season_score = self._season_score(items, season) * 20  # 0–20
        occasion_score = self._occasion_score(items, outfit_cat) * 20  # 0–20
        completeness = self._completeness_score(items, outfit_cat) * 10  # 0–10
        confidence = self._confidence_score(items) * 10  # 0–10

        total = colour_score + style_score + season_score + occasion_score + completeness + confidence
        return round(total, 1)

    @staticmethod
    def _item_colour(item: dict) -> str:
        return _attr_value(item.get("attributes", {}), "color") or "unknown"

    @staticmethod
    def _item_style(item: dict) -> str:
        raw = _attr_value(item.get("attributes", {}), "style")
        return _norm(raw) if raw else "casual"

    def _season_score(self, items: list[dict], season: Optional[str]) -> float:
        if not season:
            return 0.8  # neutral when no filter.

        target = _norm(season)
        match_count = 0
        for item in items:
            item_seasons = [_norm(s) for s in _list_values(item.get("attributes", {}), "season")]
            if target in item_seasons:
                match_count += 1

        return match_count / max(len(items), 1)

    def _occasion_score(self, items: list[dict], outfit_cat: str) -> float:
        target_occs = OCCASION_MAP.get(outfit_cat, [])
        if not target_occs:
            return 0.8

        match_count = 0
        for item in items:
            item_occs = [_norm(o) for o in _list_values(item.get("attributes", {}), "occasion")]
            if any(o in target_occs for o in item_occs):
                match_count += 1

        return match_count / max(len(items), 1)

    def _completeness_score(self, items: list[dict], outfit_cat: str) -> float:
        template = OUTFIT_CATEGORIES[outfit_cat]
        required = sum(1 for n in template.values() if not n)
        filled = 0

        item_cats = set()
        for item in items:
            cat = _canonical_category(
                _attr_value(item.get("attributes", {}), "category")
            )
            if cat:
                item_cats.add(cat)

        for slot_name, nullable in template.items():
            if not nullable:
                if slot_name == "dress" and ("dress" in item_cats or ("top" in item_cats and "bottom" in item_cats)):
                    filled += 1
                elif slot_name in item_cats:
                    filled += 1

        return filled / max(required, 1)

    @staticmethod
    def _confidence_score(items: list[dict]) -> float:
        if not items:
            return 0.0

        total = 0.0
        count = 0
        key_attrs = ["category", "type", "color", "style", "season", "occasion"]
        for item in items:
            attrs = item.get("attributes", {})
            for key in key_attrs:
                conf = _attr_confidence(attrs, key, default=0.5)
                total += conf
                count += 1

        return total / max(count, 1)

    # ── Explanations ──

    def _explain(
        self,
        items: list[dict],
        outfit_cat: str,
        season: Optional[str],
    ) -> str:
        parts: list[str] = []

        # Occasion-based explanation.
        templates = EXPLANATION_TEMPLATES.get(outfit_cat, [])
        if templates:
            parts.append(random.choice(templates))

        # Colour insight.
        colours = [self._item_colour(i) for i in items]
        if len(set(c for c in colours if c != "unknown")) >= 2:
            parts.append(random.choice(COLOUR_HARMONY_EXPLANATIONS))

        # Style insight.
        styles = [self._item_style(i) for i in items]
        unique_styles = set(s for s in styles if s)
        if len(unique_styles) <= 2 and len(unique_styles) > 0:
            parts.append(random.choice(STYLE_EXPLANATIONS))

        # Season insight.
        if season and season in SEASON_EXPLANATIONS:
            parts.append(SEASON_EXPLANATIONS[season])

        # Fallback.
        if not parts:
            parts.append(
                OCCASION_EXPLANATIONS.get(outfit_cat, "A well-coordinated outfit.")
            )

        return " ".join(parts)
