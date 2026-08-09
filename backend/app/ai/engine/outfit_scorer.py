"""Outfit scorer — weighted multi-dimensional scoring engine.

Evaluates each candidate outfit across 10 deterministic dimensions
and produces a composite score with full breakdown for explainability.
No AI — purely rule-based using configuration weights.
"""

import logging
from typing import Optional

from app.ai.models.outfit_candidate import OutfitCandidate, ScoreComponent
from app.ai.engine.scoring_config import DEFAULT_WEIGHTS
from app.ai.engine.filter_engine import FilterEngine, FilterContext
from app.services.recommendations.rules import OUTFIT_CATEGORIES

logger = logging.getLogger(__name__)

_KEY_ATTRS = ["category", "type", "color", "style", "season", "occasion", "material"]


class OutfitScorer:
    """Score candidate outfits across multiple deterministic dimensions."""

    def __init__(self, filter_engine: FilterEngine) -> None:
        """Initialise with a filter engine for sub-scoring helpers.

        Args:
            filter_engine: A ``FilterEngine`` for season, compatibility,
                           and color sub-scores.
        """
        self._filter = filter_engine

    def score(
        self,
        outfit: list[dict],
        context: FilterContext,
    ) -> OutfitCandidate:
        """Compute the full multi-dimensional score for an outfit.

        Args:
            outfit: List of clothing item dicts forming one outfit.
            context: Filter context with season, weather, occasion.

        Returns:
            ``OutfitCandidate`` with composite score and full breakdown.
        """
        weights = DEFAULT_WEIGHTS
        outfit_id = self._outfit_id(outfit)
        outfit_category = context.outfit_category or "casual"

        components = self._compute_all_components(outfit, context, weights)
        total = round(sum(c.weighted_score for c in components), 4)

        by_dimension = {c.dimension: c.raw_score for c in components}
        matched, rejected = self._classify_rules(outfit, context, by_dimension)

        return OutfitCandidate(
            outfit_id=outfit_id,
            items=[self._item_to_candidate(i) for i in outfit],
            score=total,
            score_breakdown=components,
            outfit_category=outfit_category,
            matched_rules=matched,
            rejected_rules=rejected,
        )

    def _compute_all_components(
        self,
        outfit: list[dict],
        context: FilterContext,
        weights,
    ) -> list[ScoreComponent]:
        season = self._score_season(outfit, context.season)
        weather = self._score_weather(outfit, context.temperature)
        occasion = self._score_occasion(outfit, context.occasion)
        color = self._score_color(outfit)
        style = self._score_style(outfit)
        material = self._score_material(outfit)
        similarity = self._score_similarity(outfit)
        completeness = self._score_completeness(outfit, context.outfit_category)
        confidence = self._score_confidence(outfit)
        missing = self._score_missing_data(outfit)

        return [
            ScoreComponent(
                dimension="season_match",
                raw_score=season,
                weight=weights.season_match,
                weighted_score=round(season * weights.season_match, 4),
            ),
            ScoreComponent(
                dimension="weather_match",
                raw_score=weather,
                weight=weights.weather_match,
                weighted_score=round(weather * weights.weather_match, 4),
            ),
            ScoreComponent(
                dimension="occasion_match",
                raw_score=occasion,
                weight=weights.occasion_match,
                weighted_score=round(occasion * weights.occasion_match, 4),
            ),
            ScoreComponent(
                dimension="color_harmony",
                raw_score=color,
                weight=weights.color_harmony,
                weighted_score=round(color * weights.color_harmony, 4),
            ),
            ScoreComponent(
                dimension="style_compatibility",
                raw_score=style,
                weight=weights.style_compatibility,
                weighted_score=round(style * weights.style_compatibility, 4),
            ),
            ScoreComponent(
                dimension="material_compatibility",
                raw_score=material,
                weight=weights.material_compatibility,
                weighted_score=round(material * weights.material_compatibility, 4),
            ),
            ScoreComponent(
                dimension="embedding_similarity",
                raw_score=similarity,
                weight=weights.embedding_similarity,
                weighted_score=round(similarity * weights.embedding_similarity, 4),
            ),
            ScoreComponent(
                dimension="completeness",
                raw_score=completeness,
                weight=weights.completeness,
                weighted_score=round(completeness * weights.completeness, 4),
            ),
            ScoreComponent(
                dimension="confidence",
                raw_score=confidence,
                weight=weights.confidence,
                weighted_score=round(confidence * weights.confidence, 4),
            ),
            ScoreComponent(
                dimension="missing_data_penalty",
                raw_score=missing,
                weight=weights.missing_data_penalty,
                weighted_score=round(missing * weights.missing_data_penalty, 4),
            ),
        ]

    # ── Per-dimension scores ──

    def _score_season(self, outfit: list[dict], season: Optional[str]) -> float:
        if season is None:
            return 0.8
        scores = [self._filter.season_engine.score_item(i, season) for i in outfit]
        return round(sum(scores) / len(scores), 4) if scores else 0.5

    def _score_weather(self, outfit: list[dict], temperature: Optional[str]) -> float:
        if temperature is None:
            return 0.8
        from app.ai.engine.rules_config import WEATHER_MATERIAL_PREFERENCES

        rules = WEATHER_MATERIAL_PREFERENCES.get(temperature)
        if rules is None:
            return 0.8
        # Norm both sides: config uses display forms ("faux leather")
        # while item materials are normed below ("faux_leather").
        avoid = {m.lower().replace(" ", "_") for m in rules.get("avoid", [])}
        prefer = {m.lower().replace(" ", "_") for m in rules.get("prefer", [])}

        scores: list[float] = []
        for item in outfit:
            mat = self._attr_val(item, "material")
            if mat:
                mat_norm = mat.lower().replace(" ", "_")
                if mat_norm in avoid:
                    scores.append(0.0)
                elif mat_norm in prefer:
                    scores.append(1.0)
                else:
                    scores.append(0.5)
            else:
                scores.append(0.7)
        return round(sum(scores) / len(scores), 4) if scores else 0.7

    def _score_occasion(self, outfit: list[dict], occasion: Optional[str]) -> float:
        if occasion is None:
            return 0.8
        from app.ai.engine.rules_config import OCCASION_COMPATIBILITY
        from app.services.recommendations.rules import _norm

        target = _norm(occasion) if occasion else None
        if target is None:
            return 0.8

        raw = OCCASION_COMPATIBILITY.get(target, set())
        allowed = {_norm(v) for v in raw}

        scores: list[float] = []
        for item in outfit:
            occs = self._extract_list(item, "occasion")
            if not occs:
                scores.append(0.5)
            elif any(_norm(o) in allowed for o in occs):
                scores.append(1.0)
            else:
                scores.append(0.0)

        return round(sum(scores) / len(scores), 4) if scores else 0.5

    def _score_color(self, outfit: list[dict]) -> float:
        return self._filter.score_colors_for_outfit(outfit)

    def _score_style(self, outfit: list[dict]) -> float:
        return self._filter.score_compatibility_for_outfit(outfit)

    def _score_material(self, outfit: list[dict]) -> float:
        from app.ai.engine.rules_config import MATERIAL_COMPATIBILITY
        from app.services.recommendations.rules import _norm

        materials = [self._attr_val(i, "material") for i in outfit]
        mat_normed = [m.lower().replace(" ", "_") for m in materials if m]

        if len(mat_normed) <= 1:
            return 0.8

        scores: list[float] = []
        for i in range(len(mat_normed)):
            for j in range(i + 1, len(mat_normed)):
                a, b = mat_normed[i], mat_normed[j]
                compat_a = MATERIAL_COMPATIBILITY.get(a, set())
                if b in compat_a or a in MATERIAL_COMPATIBILITY.get(b, set()):
                    scores.append(1.0)
                else:
                    scores.append(0.3)

        return round(sum(scores) / len(scores), 4) if scores else 0.5

    def _score_similarity(self, outfit: list[dict]) -> float:
        scores = [i.get("similarity_score", 0.5) for i in outfit]
        return round(sum(scores) / len(scores), 4) if scores else 0.5

    def _score_completeness(self, outfit: list[dict], outfit_category: Optional[str]) -> float:
        category = outfit_category or "casual"
        template = OUTFIT_CATEGORIES.get(category)
        if template is None:
            return 0.5

        from app.services.recommendations.rules import _canonical_category

        item_cats: set[str] = set()
        for item in outfit:
            attrs = item.get("attributes", {})
            cat = self._attr_val_from_dict(attrs, "category")
            if cat:
                canonical = _canonical_category(cat)
                if canonical:
                    item_cats.add(canonical)

        has_dress = "dress" in item_cats
        dress_in_template = "dress" in template

        filled = 0
        required = 0
        for slot, nullable in template.items():
            if nullable:
                if slot in item_cats:
                    filled += 1
                    required += 1
                continue
            if slot == "dress":
                continue
            if slot in ("top", "bottom") and dress_in_template and has_dress:
                filled += 1
                required += 1
                continue
            required += 1
            if slot in item_cats:
                filled += 1

        return round(filled / max(required, 1), 4)

    def _score_confidence(self, outfit: list[dict]) -> float:
        total = 0.0
        count = 0
        for item in outfit:
            attrs = item.get("attributes", {})
            for key in _KEY_ATTRS:
                conf = self._attr_confidence(attrs, key)
                total += conf
                count += 1

        return round(total / max(count, 1), 4)

    def _score_missing_data(self, outfit: list[dict]) -> float:
        """Score for missing data — returns a penalty.

        Lower score = better (less missing data). We invert this in the
        final total since it's a penalty (higher = worse, so we give a
        low raw score for lots of missing data).
        """
        total_missing = 0
        total_possible = 0
        for item in outfit:
            attrs = item.get("attributes", {})
            for key in _KEY_ATTRS:
                total_possible += 1
                val = attrs.get(key)
                if val is None:
                    total_missing += 1
                    continue
                if isinstance(val, dict):
                    v = val.get("value")
                    if v is None or (isinstance(v, str) and not v.strip()):
                        total_missing += 1
                    continue
                if isinstance(val, (list, tuple)) and len(val) == 0:
                    total_missing += 1

        if total_possible == 0:
            return 0.0
        missing_ratio = total_missing / total_possible
        # Invert: 0% missing = 1.0 score, 100% missing = 1.0 - 0.5 = 0.5 range.
        return round(max(0.0, 1.0 - missing_ratio), 4)

    # ── Rule classification ──

    def _classify_rules(
        self,
        outfit: list[dict],
        context: FilterContext,
        scores: dict[str, float],
    ) -> tuple[list[str], list[str]]:
        matched: list[str] = []
        rejected: list[str] = []

        # Rule outcomes reuse the dimension scores already computed in
        # _compute_all_components — recomputing them here would triple
        # the per-combo cost of three dimensions.
        # Season
        if context.season:
            season_score = scores.get("season_match", 0.5)
            if season_score > 0.5:
                matched.append(f"season:{context.season}")
            else:
                rejected.append(f"season:{context.season}")

        # Weather
        if context.temperature:
            weather_score = scores.get("weather_match", 0.5)
            if weather_score > 0.5:
                matched.append(f"weather:{context.temperature}")
            else:
                rejected.append(f"weather:{context.temperature}")

        # Occasion
        if context.occasion:
            occasion_score = scores.get("occasion_match", 0.5)
            if occasion_score > 0.5:
                matched.append(f"occasion:{context.occasion}")
            else:
                rejected.append(f"occasion:{context.occasion}")

        return matched, rejected

    # ── Helpers ──

    @staticmethod
    def _outfit_id(outfit: list[dict]) -> str:
        return "-".join(sorted(i["id"] for i in outfit))

    @staticmethod
    def _item_to_candidate(item: dict):
        from app.ai.models.candidate import CandidateItem

        attrs = item.get("attributes", {})
        cat = OutfitScorer._attr_val_from_dict(attrs, "category")
        color = OutfitScorer._attr_val_from_dict(attrs, "color")
        style = OutfitScorer._attr_val_from_dict(attrs, "style")
        season_list = OutfitScorer._extract_list(item, "season")
        occasion_list = OutfitScorer._extract_list(item, "occasion")

        return CandidateItem(
            id=item["id"],
            attributes=attrs,
            thumbnail_url=item.get("thumbnail_url"),
            original_image_url=item.get("original_image_url"),
            similarity_score=item.get("similarity_score", 0.0),
            category=cat,
            color=color,
            season=season_list[0] if season_list else None,
            occasion=occasion_list[0] if occasion_list else None,
            style=style,
        )

    @staticmethod
    def _attr_val(item: dict, key: str) -> Optional[str]:
        attrs = item.get("attributes", {})
        return OutfitScorer._attr_val_from_dict(attrs, key)

    @staticmethod
    def _attr_val_from_dict(attrs: dict, key: str) -> Optional[str]:
        val = attrs.get(key)
        if isinstance(val, dict):
            v = val.get("value")
            if isinstance(v, str) and v.strip():
                return v.strip()
            return None
        if isinstance(val, str) and val.strip():
            return val.strip()
        return None

    @staticmethod
    def _extract_list(item: dict, key: str) -> list[str]:
        attrs = item.get("attributes", {})
        entries = attrs.get(key) or []
        if not isinstance(entries, list):
            return []
        result: list[str] = []
        for e in entries:
            if isinstance(e, dict):
                v = e.get("value")
                if isinstance(v, str) and v.strip():
                    result.append(v.strip())
            elif isinstance(e, str) and e.strip():
                result.append(e.strip())
        return result

    @staticmethod
    def _attr_confidence(attrs: dict, key: str, default: float = 0.5) -> float:
        val = attrs.get(key)
        if isinstance(val, dict):
            c = val.get("confidence")
            if c is not None:
                try:
                    return float(c)
                except (TypeError, ValueError):
                    # A poisoned row (non-numeric confidence) must not crash
                    # scoring for the whole wardrobe.
                    return default
        return default
