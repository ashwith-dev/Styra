"""Occasion engine — filters clothing by occasion compatibility.

Uses deterministic compatibility tables and item-level type rules
from the centralized config.
"""

from typing import Optional

from app.ai.engine.rules_config import OCCASION_COMPATIBILITY, ITEM_TYPE_OCCASION_RULES
from app.services.recommendations.rules import (
    _attr_value, _norm, _canonical_category,
)


class OccasionEngine:
    """Filter clothing items by occasion suitability."""

    def filter(self, items: list[dict], occasion: Optional[str]) -> list[dict]:
        """Keep items suitable for the target occasion.

        Items with no occasion data pass through. Items with conflicting
        type-level rules are removed.

        Args:
            items: Clothing item dicts with ``attributes``.
            occasion: Target occasion or ``None`` to disable.

        Returns:
            Filtered list.
        """
        if occasion is None:
            return list(items)

        target = _norm(occasion)
        raw_compat = OCCASION_COMPATIBILITY.get(target)
        if raw_compat is None:
            return list(items)

        # Normalize the compatibility set for comparison.
        compatible_occs = {_norm(v) for v in raw_compat}

        kept: list[dict] = []
        for item in items:
            item_occs = self._extract_occasions(item)

            # If item has occasion data, check compatibility.
            if item_occs:
                if not any(_norm(o) in compatible_occs for o in item_occs):
                    continue

            # Check item-type-level rules.
            if self._item_type_conflicts(item, target):
                continue

            kept.append(item)

        return kept

    def _item_type_conflicts(self, item: dict, occasion: str) -> bool:
        """Check if the item's specific type conflicts with the occasion.

        Returns True if the item type is explicitly unsuitable.
        """
        attrs = item.get("attributes", {})
        cat_val = _canonical_category(_attr_value(attrs, "category"))
        if cat_val is None:
            return False

        type_val = _attr_value(attrs, "type")
        if type_val is None:
            return False

        cat_rules = ITEM_TYPE_OCCASION_RULES.get(cat_val, {})
        occasion_rules = cat_rules.get(occasion)
        if occasion_rules is None:
            return False

        type_norm = _norm(type_val)
        unsuitable = {_norm(v) for v in occasion_rules.get("unsuitable", [])}
        if type_norm in unsuitable:
            return True

        suitable = {_norm(v) for v in occasion_rules.get("suitable", [])}
        if suitable and type_norm not in suitable:
            return True

        return False

    @staticmethod
    def _extract_occasions(item: dict) -> list[str]:
        attrs = item.get("attributes", {})
        entries = attrs.get("occasion") or []
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
