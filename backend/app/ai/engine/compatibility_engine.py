"""Compatibility engine — deterministic outfit item compatibility.

Scores how well two clothing items work together based on style,
material, and explicit pairing rules. No AI — purely rule-based.
"""

from typing import Optional

from app.ai.engine.rules_config import MATERIAL_COMPATIBILITY
from app.services.recommendations.rules import (
    StyleCompatibility, _attr_value, _canonical_category, _norm,
)


class CompatibilityEngine:
    """Score compatibility between pairs of clothing items."""

    def score_pair(
        self,
        item_a: dict,
        item_b: dict,
    ) -> float:
        """Compute a 0.0–1.0 compatibility score between two items.

        Factors: style compatibility (50%), material compatibility (50%).

        Args:
            item_a: First clothing item dict.
            item_b: Second clothing item dict.

        Returns:
            Compatibility score between 0.0 and 1.0.
        """
        style_a = self._extract_style(item_a)
        style_b = self._extract_style(item_b)

        material_a = self._extract_material(item_a)
        material_b = self._extract_material(item_b)

        style_score = self._score_style(style_a, style_b)
        material_score = self._score_materials(material_a, material_b)

        return round((style_score * 0.5) + (material_score * 0.5), 4)

    def score_outfit(self, items: list[dict]) -> float:
        """Average pairwise compatibility across all items in an outfit.

        Args:
            items: List of clothing item dicts.

        Returns:
            Average compatibility score, 0.0–1.0.
        """
        if len(items) <= 1:
            return 1.0

        scores: list[float] = []
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                scores.append(self.score_pair(items[i], items[j]))

        if not scores:
            return 0.5
        return round(sum(scores) / len(scores), 4)

    @staticmethod
    def _score_style(style_a: Optional[str], style_b: Optional[str]) -> float:
        if not style_a or not style_b:
            return 0.7
        return StyleCompatibility.score([style_a, style_b])

    @staticmethod
    def _score_materials(
        material_a: Optional[str],
        material_b: Optional[str],
    ) -> float:
        if not material_a or not material_b:
            return 0.7
        if material_a == material_b:
            return 0.9

        compat = MATERIAL_COMPATIBILITY.get(material_a)
        if compat and material_b in compat:
            return 0.85

        compat_b = MATERIAL_COMPATIBILITY.get(material_b)
        if compat_b and material_a in compat_b:
            return 0.85

        return 0.5

    @staticmethod
    def _extract_style(item: dict) -> Optional[str]:
        attrs = item.get("attributes", {})
        style = _attr_value(attrs, "style")
        if style:
            return _norm(style)
        return None

    @staticmethod
    def _extract_material(item: dict) -> Optional[str]:
        attrs = item.get("attributes", {})
        material = _attr_value(attrs, "material")
        if material:
            return _norm(material)
        return None
