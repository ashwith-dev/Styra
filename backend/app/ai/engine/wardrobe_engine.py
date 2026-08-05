"""Wardrobe engine — gender-based filtering.

Ensures items respect the user's wardrobe gender preference.
Deterministic: uses config-based gender compatibility sets.
"""

from typing import Optional

from app.ai.engine.rules_config import GENDER_COMPATIBILITY
from app.services.recommendations.rules import _attr_value, _norm


class WardrobeEngine:
    """Filter clothing by wardrobe gender preference."""

    def filter(
        self,
        items: list[dict],
        wardrobe_gender: Optional[str] = None,
    ) -> list[dict]:
        """Keep items compatible with the wardrobe's gender preference.

        Items without a gender attribute are treated as unisex and
        always included.

        Args:
            items: Clothing item dicts with ``attributes``.
            wardrobe_gender: ``"men"``, ``"women"``, ``"mixed"``, or
                             ``None`` to disable.

        Returns:
            Filtered list.
        """
        if wardrobe_gender is None:
            return list(items)

        target = _norm(wardrobe_gender)
        allowed = GENDER_COMPATIBILITY.get(target)
        if allowed is None:
            return list(items)

        kept: list[dict] = []
        for item in items:
            gender = self._extract_gender(item)
            if gender is None or _norm(gender) in allowed:
                kept.append(item)

        return kept

    @staticmethod
    def _extract_gender(item: dict) -> Optional[str]:
        attrs = item.get("attributes", {})
        gender = _attr_value(attrs, "gender")
        return gender
