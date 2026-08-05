"""Color engine — deterministic color harmony evaluation.

Pure rule-based scoring using explicit pair rules and hue-group
analysis from the existing ``ColourHarmony`` rules.
"""

from typing import Optional

from app.ai.engine.rules_config import COLOR_PAIR_RULES
from app.services.recommendations.rules import (
    ColourHarmony, _attr_value, _norm,
)


class ColorEngine:
    """Evaluate color harmony deterministically."""

    def score_pair(self, color_a: Optional[str], color_b: Optional[str]) -> float:
        """Score harmony between two colors, 0.0–1.0.

        Args:
            color_a: First color name.
            color_b: Second color name.

        Returns:
            Harmony score. 1.0 for known high-harmony pairs, lower
            for unknown combinations.
        """
        if not color_a or not color_b:
            return 0.7

        a_norm = _norm(color_a)
        b_norm = _norm(color_b)

        high_pairs = COLOR_PAIR_RULES["high_harmony"]
        if (a_norm, b_norm) in high_pairs or (b_norm, a_norm) in high_pairs:
            return 1.0

        return ColourHarmony.score([color_a, color_b])

    def score_outfit(self, items: list[dict]) -> float:
        """Score overall color harmony across all items in an outfit.

        Args:
            items: List of clothing item dicts.

        Returns:
            Average pair-wise harmony score, 0.0–1.0.
        """
        colors = [self._extract_color(item) for item in items]
        valid = [c for c in colors if c]

        if len(valid) <= 1:
            return 1.0

        scores: list[float] = []
        for i in range(len(valid)):
            for j in range(i + 1, len(valid)):
                scores.append(self.score_pair(valid[i], valid[j]))

        if not scores:
            return 0.7
        return round(sum(scores) / len(scores), 4)

    @staticmethod
    def _extract_color(item: dict) -> Optional[str]:
        attrs = item.get("attributes", {})
        return _attr_value(attrs, "color")
