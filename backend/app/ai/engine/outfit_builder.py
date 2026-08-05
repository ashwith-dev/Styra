"""Outfit builder — generates valid outfit combinations from partitioned items.

Builds all valid outfit combinations: mandatory top + bottom (or dress
as replacement), plus optional footwear/outerwear/accessory picks.
Designed for wardrobes with 500+ items via pre-scored candidate caps.
"""

from typing import Optional

from app.ai.engine.scoring_config import MAX_CANDIDATES_PER_SLOT, MAX_COMBINATIONS


class OutfitBuilder:
    """Generate valid outfit combinations from partitioned candidates."""

    def build(
        self,
        partitioned: dict[str, list[dict]],
        outfit_category: str,
        *,
        max_candidates_per_slot: int = MAX_CANDIDATES_PER_SLOT,
        max_combinations: int = MAX_COMBINATIONS,
    ) -> list[list[dict]]:
        """Build all valid outfit combinations.

        Mandatory: top + bottom, or dress alone.
        Optional: footwear, outerwear, accessory — each either picks
        the single best candidate (by similarity score) or is absent.

        Args:
            partitioned: Category → list of item dicts.
            outfit_category: e.g. ``"casual"``.
            max_candidates_per_slot: Max items per mandatory slot.
            max_combinations: Hard cap on total results.

        Returns:
            List of outfit combinations, each a list of item dicts.
        """
        tops = self._top_n(partitioned.get("top", []), max_candidates_per_slot)
        bottoms = self._top_n(partitioned.get("bottom", []), max_candidates_per_slot)
        dresses = self._top_n(partitioned.get("dress", []), max_candidates_per_slot)

        footwear_opts = self._optional_pool(partitioned.get("footwear", []))
        outerwear_opts = self._optional_pool(partitioned.get("outerwear", []))
        accessory_opts = self._optional_pool(partitioned.get("accessory", []))

        has_dress_template = outfit_category in _DRESS_TEMPLATE_CATEGORIES
        seed_pairs: list[list[dict]] = []

        # Dress-first: dress replaces top + bottom.
        if has_dress_template and dresses:
            for dress in dresses:
                seed_pairs.append([dress])

        # Standard top + bottom pairs.
        for top in tops:
            for bottom in bottoms:
                seed_pairs.append([top, bottom])

        # Generate all combinations with optionals.
        seen: set[frozenset[str]] = set()
        result: list[list[dict]] = []

        for seed in seed_pairs:
            for fw in footwear_opts:
                for ow in outerwear_opts:
                    for ac in accessory_opts:
                        combo = list(seed)
                        if fw:
                            combo.append(fw)
                        if ow:
                            combo.append(ow)
                        if ac:
                            combo.append(ac)

                        key = frozenset(i["id"] for i in combo)
                        if key in seen:
                            continue
                        seen.add(key)
                        result.append(combo)

                        if len(result) >= max_combinations:
                            return result

        return result

    @staticmethod
    def _top_n(items: list[dict], n: int) -> list[dict]:
        """Return the top *n* items by similarity score (or all if fewer)."""
        if len(items) <= n:
            return items
        scored = [(i.get("similarity_score", 0.5), i) for i in items]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [i for _, i in scored[:n]]

    @staticmethod
    def _optional_pool(items: list[dict]) -> list[Optional[dict]]:
        """Return [None, best_item] for an optional slot.

        None means the slot is skipped. Only the single best candidate
        (highest similarity) is considered for inclusion.
        """
        if not items:
            return [None]
        best = max(items, key=lambda i: i.get("similarity_score", 0.5))
        return [None, best]


_DRESS_TEMPLATE_CATEGORIES = frozenset({"formal", "party", "date_night", "ethnic"})
