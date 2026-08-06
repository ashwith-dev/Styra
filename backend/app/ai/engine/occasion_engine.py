"""Occasion engine — filters clothing by occasion compatibility.

Uses deterministic compatibility tables and item-level type rules
from the centralized config.
"""

from typing import Optional

from app.ai.engine.rules_config import OCCASION_COMPATIBILITY, ITEM_TYPE_OCCASION_RULES
from app.services.recommendations.rules import (
    _attr_value, _norm, _canonical_category,
)


# Aliases applied to the *request* occasion only. Item-side occasion values
# keep their canonical form (e.g. "date_night") because the compatibility
# sets in rules_config are keyed on those values, while the table's target
# keys use the short form ("date").
_TARGET_ALIASES: dict[str, str] = {
    "date_night": "date",
}


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
        target = _TARGET_ALIASES.get(target, target)
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
        Also checks subcategory if type is not available.
        """
        attrs = item.get("attributes", {})

        # Collect all possible type identifiers for this item:
        # type first, then subcategory, then raw category value.
        type_candidates: list[str] = []
        for key in ("type", "subcategory", "category"):
            val = _attr_value(attrs, key)
            if val:
                type_candidates.append(_norm(val))

        if not type_candidates:
            return False

        type_val = _attr_value(attrs, "type") or _attr_value(attrs, "subcategory")
        cat_val = _canonical_category(_attr_value(attrs, "category"), type_val)

        if cat_val is None:
            # No category metadata: fall back to the union of this
            # occasion's unsuitable types across all categories. Only
            # positive evidence blocks (lenient default-allow) — e.g.
            # null-category jeans are still blocked at formal.
            union_unsuitable: set[str] = set()
            for cat_rules in ITEM_TYPE_OCCASION_RULES.values():
                occ_rules = cat_rules.get(occasion)
                if occ_rules:
                    union_unsuitable.update(
                        _norm(v) for v in occ_rules.get("unsuitable", [])
                    )
            return any(tc in union_unsuitable for tc in type_candidates)

        cat_rules = ITEM_TYPE_OCCASION_RULES.get(cat_val, {})
        occasion_rules = cat_rules.get(occasion)
        if occasion_rules is None:
            return False

        unsuitable = {_norm(v) for v in occasion_rules.get("unsuitable", [])}
        suitable = {_norm(v) for v in occasion_rules.get("suitable", [])}

        # Check if ANY identifier matches an unsuitable type
        for tc in type_candidates:
            if tc in unsuitable:
                return True

        # If suitable list exists and NONE of the identifiers match, block it
        if suitable:
            if not any(tc in suitable for tc in type_candidates):
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
