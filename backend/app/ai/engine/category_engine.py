"""Category engine — validates outfit slot requirements.

Ensures each outfit category has the correct mandatory items:
exactly one top, one bottom, with optional slots for footwear,
outerwear, and accessories.
"""

from typing import Optional

from app.services.recommendations.rules import (
    OUTFIT_CATEGORIES, _canonical_category, _attr_value,
)


class CategoryEngine:
    """Validate outfit category slot requirements."""

    def validate_outfit_slots(
        self,
        items: list[dict],
        outfit_category: str,
    ) -> bool:
        """Check whether *items* satisfy the slot requirements for
        *outfit_category*.

        When a dress slot exists in the template (even if optional),
        it can replace the top+bottom pair. Only one of (dress) or
        (top+bottom) must be present for a valid outfit.

        Args:
            items: Candidate clothing item dicts forming an outfit.
            outfit_category: Target outfit category (e.g. ``"casual"``).

        Returns:
            ``True`` if all mandatory slots are filled and no invalid
            configurations exist.
        """
        template = OUTFIT_CATEGORIES.get(outfit_category)
        if template is None:
            return False

        item_cats: set[str] = set()
        for item in items:
            cat = self._extract_category(item)
            if cat:
                item_cats.add(cat)

        has_dress = "dress" in item_cats
        dress_present_in_template = "dress" in template

        for slot_name, nullable in template.items():
            if nullable:
                continue
            if slot_name == "dress":
                continue
            # If dress is present in template and we have a dress, skip
            # top+bottom slot checks — dress covers them.
            if slot_name in ("top", "bottom") and dress_present_in_template and has_dress:
                continue
            if slot_name not in item_cats:
                return False

        return True

    def partition_items(
        self,
        items: list[dict],
    ) -> dict[str, list[dict]]:
        """Group items by canonical wardrobe category.

        Args:
            items: List of clothing item dicts.

        Returns:
            Dict mapping category name → list of items.
        """
        partitioned: dict[str, list[dict]] = {
            "top": [], "bottom": [], "dress": [],
            "outerwear": [], "footwear": [], "accessory": [],
        }
        for item in items:
            cat = self._extract_category(item)
            if cat and cat in partitioned:
                partitioned[cat].append(item)
        return partitioned

    def get_required_slots(self, outfit_category: str) -> list[str]:
        """Return the list of mandatory slot names for *outfit_category*.

        Args:
            outfit_category: Target outfit category.

        Returns:
            List of required slot names.
        """
        template = OUTFIT_CATEGORIES.get(outfit_category)
        if template is None:
            return []
        return [name for name, nullable in template.items() if not nullable]

    def get_optional_slots(self, outfit_category: str) -> list[str]:
        """Return the list of optional slot names for *outfit_category*.

        Args:
            outfit_category: Target outfit category.

        Returns:
            List of optional slot names.
        """
        template = OUTFIT_CATEGORIES.get(outfit_category)
        if template is None:
            return []
        return [name for name, nullable in template.items() if nullable]

    @staticmethod
    def _extract_category(item: dict) -> Optional[str]:
        attrs = item.get("attributes", {})
        raw_cat = _attr_value(attrs, "category")
        return _canonical_category(raw_cat)
