"""Season engine — filters and scores clothing by season compatibility.

Deterministic season matching from config. Items with no season data
are kept but receive a lower priority score for later sorting.
"""

from typing import Optional

from app.ai.engine.rules_config import SEASON_COMPATIBILITY, SEASON_WARMTH_SCORES
from app.services.recommendations.rules import _norm


class SeasonEngine:
    """Filter clothing items by season suitability."""

    def filter(self, items: list[dict], season: Optional[str]) -> list[dict]:
        """Keep items compatible with the target season.

        Items with no season data are included (assumed all-season).

        Args:
            items: Clothing item dicts with ``attributes``.
            season: Target season or ``None`` to disable.

        Returns:
            Filtered list.
        """
        if season is None:
            return list(items)

        target = _norm(season)
        compatible = SEASON_COMPATIBILITY.get(target)
        if compatible is None:
            return list(items)

        kept: list[dict] = []
        for item in items:
            seasons = self._extract_seasons(item)
            if not seasons:
                kept.append(item)
                continue
            if any(_norm(s) in compatible for s in seasons):
                kept.append(item)

        return kept

    def score_item(self, item: dict, season: Optional[str]) -> float:
        """Score an item's season fit, 0.0–1.0.

        Args:
            item: Clothing item dict.
            season: Target season.

        Returns:
            Score: 1.0 for exact match, 0.0 for incompatible, 0.5 for unknown.
        """
        if season is None:
            return 0.5

        target = _norm(season)
        warmth_scores = SEASON_WARMTH_SCORES.get(target, {})
        seasons = self._extract_seasons(item)

        if not seasons:
            return 0.5

        best = max((warmth_scores.get(_norm(s), 0.0) for s in seasons), default=0.0)
        return best

    @staticmethod
    def _extract_seasons(item: dict) -> list[str]:
        attrs = item.get("attributes", {})
        entries = attrs.get("season") or []
        if not isinstance(entries, list):
            return []
        result: list[str] = []
        for entry in entries:
            if isinstance(entry, dict):
                val = entry.get("value")
                if isinstance(val, str) and val.strip():
                    result.append(val.strip())
            elif isinstance(entry, str) and entry.strip():
                result.append(entry.strip())
        return result
