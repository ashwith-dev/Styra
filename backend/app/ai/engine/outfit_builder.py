"""Outfit builder — generates valid outfit combinations from partitioned items.

Builds all valid outfit combinations: mandatory top + bottom (or dress
as replacement), plus optional footwear/outerwear/accessory picks.
Designed for wardrobes with 500+ items via pre-scored candidate caps.
"""

import itertools
import random
from typing import Iterator, Optional

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
        Optional: footwear, outerwear, accessory.

        Args:
            partitioned: Category → list of item dicts.
            outfit_category: e.g. ``"casual"``.
            max_candidates_per_slot: Max items per mandatory slot.
            max_combinations: Hard cap on total results.

        Returns:
            List of outfit combinations, each a list of item dicts.
        """
        tops = self._shuffled_top_n(partitioned.get("top", []), max_candidates_per_slot)
        bottoms = self._shuffled_top_n(partitioned.get("bottom", []), max_candidates_per_slot)
        dresses = self._shuffled_top_n(partitioned.get("dress", []), max_candidates_per_slot)

        # Optional slots are capped too — otherwise large wardrobes explode
        # the combination space (see round-robin note below).
        footwear_items = self._shuffled_top_n(partitioned.get("footwear", []), max_candidates_per_slot)
        outerwear_items = self._shuffled_top_n(partitioned.get("outerwear", []), max_candidates_per_slot)
        accessory_items = self._shuffled_top_n(partitioned.get("accessory", []), max_candidates_per_slot)

        # Footwear is compulsory for every outfit generation
        if footwear_items:
            footwear_opts: list[Optional[dict]] = list(footwear_items)
            random.shuffle(footwear_opts)
        else:
            footwear_opts = [None]
        outerwear_opts = self._optional_pool(outerwear_items)
        accessory_opts = self._optional_pool(accessory_items)

        seed_pairs: list[list[dict]] = []

        # Dress-first: a dress replaces top + bottom for every occasion
        # except gym (where dresses are never appropriate).
        if outfit_category != "gym" and dresses:
            for dress in dresses:
                seed_pairs.append([dress])

        # Standard top + bottom pairs.
        for top in tops:
            for bottom in bottoms:
                seed_pairs.append([top, bottom])

        # Shuffle seed pairs so each request surfaces different combos first.
        random.shuffle(seed_pairs)

        def _expand(seed: list[dict]) -> Iterator[list[dict]]:
            for fw, ow, ac in itertools.product(footwear_opts, outerwear_opts, accessory_opts):
                combo = list(seed)
                if fw:
                    combo.append(fw)
                if ow:
                    combo.append(ow)
                if ac:
                    combo.append(ac)
                yield combo

        # Round-robin across seeds: one combo per seed per pass, so the
        # max_combinations cap can never be exhausted by a single seed
        # (which previously collapsed results to "same core, different shoes").
        seen: set[frozenset[str]] = set()
        result: list[list[dict]] = []
        active = [_expand(seed) for seed in seed_pairs]

        while active and len(result) < max_combinations:
            survivors: list[Iterator[list[dict]]] = []
            for gen in active:
                try:
                    combo = next(gen)
                except StopIteration:
                    continue

                key = frozenset(i["id"] for i in combo)
                if key not in seen:
                    seen.add(key)
                    result.append(combo)
                    if len(result) >= max_combinations:
                        return result
                survivors.append(gen)
            active = survivors

        return result

    @staticmethod
    def _shuffled_top_n(items: list[dict], n: int) -> list[dict]:
        """Return up to *n* items, uniformly shuffled for variety.

        Selection is a plain uniform shuffle (no similarity weighting);
        for pools larger than *n* only the first ``n * 2`` items in
        partition order are eligible.
        """
        if not items:
            return []
        pool = items[:] if len(items) <= n else items[:n * 2]  # consider slightly more than n
        random.shuffle(pool)
        return pool[:n]

    @staticmethod
    def _optional_pool(
        items: list[dict],
        prefer_filled: bool = False,
    ) -> list[Optional[dict]]:
        """Return all items as options for an optional slot, plus None (skip).

        When ``prefer_filled`` is True (e.g. casual outfits) and items are
        available, None is placed at the end so footwear is tried first.
        """
        if not items:
            return [None]
        # Shuffle footwear options for variety.
        shuffled = items[:]
        random.shuffle(shuffled)
        if prefer_filled:
            # Try all shoes first, then also generate without shoe.
            return list(shuffled) + [None]
        else:
            return [None] + list(shuffled)
