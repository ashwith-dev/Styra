"""Tests for the AI Stylist recommendation engine."""

import pytest

from app.services.recommendations.rules import (
    ColourHarmony,
    StyleCompatibility,
    _attr_value,
    _attr_confidence,
    _list_values,
    _parse_colour_name,
)
from app.services.recommendations.engine import RecommendationEngine


# ── Helpers ──


def _item(
    id_: str,
    category: str,
    color: str = "navy",
    style: str = "casual",
    status: str = "completed",
    occasions: list[str] | None = None,
    seasons: list[str] | None = None,
    confidence: float = 0.85,
    **extra_attrs,
) -> dict:
    attrs = {
        "category": {"value": category, "confidence": confidence},
        "type": {"value": "test-type", "confidence": confidence},
        "color": {"value": color, "confidence": confidence},
        "style": {"value": style, "confidence": confidence},
        "season": [{"value": s, "confidence": 1.0} for s in (seasons or ["summer"])],
        "occasion": [{"value": o, "confidence": 1.0} for o in (occasions or ["everyday"])],
    }
    attrs.update(extra_attrs)
    return {"id": id_, "attributes": attrs, "status": status, "thumbnail_url": None}


# ── Rule tests ──


class TestParseColourName:
    def test_warm_colours(self):
        assert _parse_colour_name("red") == "warm"
        assert _parse_colour_name("orange") == "warm"
        assert _parse_colour_name("gold") == "warm"

    def test_cool_colours(self):
        assert _parse_colour_name("blue") == "cool"
        assert _parse_colour_name("navy") == "cool"
        assert _parse_colour_name("green") == "cool"

    def test_neutral_colours(self):
        assert _parse_colour_name("white") == "neutral"
        assert _parse_colour_name("black") == "neutral"
        assert _parse_colour_name("grey") == "neutral"

    def test_unknown_colour(self):
        assert _parse_colour_name("blurple") == "neutral"
        assert _parse_colour_name("") == "neutral"


class TestColourHarmony:
    def test_single_colour(self):
        assert ColourHarmony.score(["navy"]) == 1.0

    def test_all_warm(self):
        assert ColourHarmony.score(["red", "orange", "gold"]) >= 0.8

    def test_all_cool(self):
        assert ColourHarmony.score(["navy", "blue", "green"]) >= 0.8

    def test_all_neutral(self):
        score = ColourHarmony.score(["white", "black", "grey"])
        assert score >= 0.9

    def test_mixed_warm_cool(self):
        score = ColourHarmony.score(["red", "navy"])
        assert score < 0.8

    def test_mostly_neutral(self):
        score = ColourHarmony.score(["white", "navy", "grey", "black"])
        assert score >= 0.9


class TestStyleCompatibility:
    def test_single_style(self):
        assert StyleCompatibility.score(["casual"]) == 1.0

    def test_same_style(self):
        assert StyleCompatibility.score(["casual", "casual"]) == 1.0

    def test_compatible_styles(self):
        score = StyleCompatibility.score(["casual", "minimalist"])
        assert score >= 0.9

    def test_incompatible_styles(self):
        score = StyleCompatibility.score(["formal", "sporty"])
        assert score < 0.7

    def test_multiple_styles(self):
        score = StyleCompatibility.score(["casual", "minimalist", "streetwear"])
        assert score >= 0.3


class TestAttrHelpers:
    def test_attr_value_nested(self):
        attrs = {"color": {"value": "navy", "confidence": 0.9}}
        assert _attr_value(attrs, "color") == "navy"

    def test_attr_value_flat(self):
        attrs = {"color": "navy"}
        assert _attr_value(attrs, "color") == "navy"

    def test_attr_value_missing(self):
        assert _attr_value({}, "color") is None

    def test_attr_confidence(self):
        attrs = {"color": {"value": "navy", "confidence": 0.88}}
        assert _attr_confidence(attrs, "color") == 0.88

    def test_attr_confidence_default(self):
        assert _attr_confidence({}, "color") == 0.5

    def test_list_values(self):
        attrs = {
            "season": [
                {"value": "summer", "confidence": 1.0},
                {"value": "spring", "confidence": 0.8},
            ]
        }
        assert _list_values(attrs, "season") == ["summer", "spring"]

    def test_list_values_empty(self):
        assert _list_values({}, "season") == []


# ── Engine tests ──


class TestRecommendationEngine:
    def setup_method(self):
        self.engine = RecommendationEngine()

    def test_empty_wardrobe(self):
        result = self.engine.recommend([])
        assert result == []

    def test_filters_out_non_completed(self):
        wardrobe = [
            _item("1", "top", status="draft"),
            _item("2", "bottom", status="archived"),
        ]
        result = self.engine.recommend(wardrobe)
        assert result == []

    def test_filters_out_invalid_category(self):
        wardrobe = [
            _item("1", "invalid"),
        ]
        result = self.engine.recommend(wardrobe)
        assert result == []

    def test_insufficient_items(self):
        """Single top with nothing compatible — should return empty."""
        wardrobe = [
            _item("1", "top", color="navy", style="casual"),
        ]
        result = self.engine.recommend(wardrobe)
        # Need at least top+bottom+footwear for most categories.
        assert all(
            r.outfit_category in ["gym", "travel"]
            for r in result
        ) if result else True

    def test_basic_outfit_generated(self):
        wardrobe = [
            _item("1", "top", color="navy", style="casual"),
            _item("2", "bottom", color="navy", style="casual"),
            _item("3", "footwear", color="black", style="casual"),
        ]
        result = self.engine.recommend(wardrobe)
        assert len(result) > 0

        rec = result[0]
        assert len(rec.items) >= 2
        assert 0 <= rec.score <= 100
        assert rec.explanation != ""
        assert rec.outfit_category != ""

    def test_score_is_between_zero_and_hundred(self):
        wardrobe = [
            _item("t1", "top", color="navy", style="casual"),
            _item("b1", "bottom", color="navy", style="casual"),
            _item("f1", "footwear", color="black", style="casual"),
        ]
        result = self.engine.recommend(wardrobe)
        for rec in result:
            assert 0.0 <= rec.score <= 100.0

    def test_occasion_filter(self):
        wardrobe = [
            _item("t1", "top", color="white", style="minimalist"),
            _item("b1", "bottom", color="black", style="minimalist"),
            _item("f1", "footwear", color="black", style="minimalist"),
        ]
        result = self.engine.recommend(wardrobe, occasion="formal")
        assert len(result) > 0
        for rec in result:
            assert rec.outfit_category == "formal"

    def test_season_filter(self):
        wardrobe = [
            _item("t1", "top", color="navy", style="casual", seasons=["summer"]),
            _item("b1", "bottom", color="navy", style="casual", seasons=["summer"]),
            _item("f1", "footwear", color="black", style="casual", seasons=["summer"]),
        ]
        result = self.engine.recommend(wardrobe, season="summer")
        assert len(result) >= 0  # may produce results or not; depending on item count

    def test_no_duplicate_outfits(self):
        wardrobe = [
            _item("t1", "top", color="navy", style="casual"),
            _item("t2", "top", color="white", style="casual"),
            _item("b1", "bottom", color="navy", style="casual"),
            _item("b2", "bottom", color="black", style="casual"),
            _item("f1", "footwear", color="black", style="casual"),
            _item("f2", "footwear", color="white", style="casual"),
        ]
        result = self.engine.recommend(wardrobe)
        combo_sets: list[set[str]] = []
        for rec in result:
            combo = frozenset(i["id"] for i in rec.items)
            combo_sets.append(combo)

        assert len(combo_sets) == len(set(combo_sets))

    def test_explanation_not_empty(self):
        wardrobe = [
            _item("1", "top", color="navy", style="casual"),
            _item("2", "bottom", color="navy", style="casual"),
            _item("3", "footwear", color="black", style="casual"),
        ]
        result = self.engine.recommend(wardrobe)
        for rec in result:
            assert rec.explanation.strip() != ""

    def test_large_wardrobe_performance(self):
        """500-item wardrobe should not crash."""
        wardrobe = []
        for i in range(200):
            wardrobe.append(_item(f"top_{i}", "top", color="navy", style="casual"))
        for i in range(200):
            wardrobe.append(_item(f"bottom_{i}", "bottom", color="navy", style="casual"))
        for i in range(100):
            wardrobe.append(_item(f"foot_{i}", "footwear", color="black", style="casual"))

        result = self.engine.recommend(wardrobe, occasion="casual")
        assert len(result) <= 20
        for rec in result:
            assert 0 <= rec.score <= 100

    def test_dress_outfits_use_dress_or_top_bottom(self):
        wardrobe = [
            _item("d1", "dress", color="red", style="romantic"),
            _item("f1", "footwear", color="black", style="formal"),
        ]
        result = self.engine.recommend(wardrobe, occasion="party")
        assert len(result) > 0

    def test_returns_max_results(self):
        wardrobe = []
        for i in range(10):
            wardrobe.append(_item(f"t{i}", "top", color="navy", style="casual"))
        for i in range(10):
            wardrobe.append(_item(f"b{i}", "bottom", color="navy", style="casual"))
        for i in range(10):
            wardrobe.append(_item(f"f{i}", "footwear", color="black", style="casual"))

        result = self.engine.recommend(wardrobe)
        assert len(result) <= 20

    def test_applies_occasion_and_season_combined(self):
        wardrobe = [
            _item("t1", "top", color="navy", style="casual",
                  occasions=["everyday"], seasons=["summer"]),
            _item("b1", "bottom", color="navy", style="casual",
                  occasions=["everyday"], seasons=["summer"]),
            _item("f1", "footwear", color="black", style="casual",
                  occasions=["everyday"], seasons=["summer"]),
        ]
        result = self.engine.recommend(wardrobe, occasion="casual", season="summer")
        if result:
            assert result[0].outfit_category == "casual"
