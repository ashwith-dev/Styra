"""Filter engine — deterministic clothing item filtering pipeline.

Orchestrates the full filtering chain: weather → season → wardrobe →
occasion → category validation. Returns only candidate items that pass
all filters. This is NOT an outfit generator — it only eliminates
invalid items before any selection/scoring phase.
"""

import logging
from typing import Optional

from app.ai.engine.weather_engine import WeatherEngine
from app.ai.engine.season_engine import SeasonEngine
from app.ai.engine.wardrobe_engine import WardrobeEngine
from app.ai.engine.occasion_engine import OccasionEngine
from app.ai.engine.category_engine import CategoryEngine
from app.ai.engine.compatibility_engine import CompatibilityEngine
from app.ai.engine.color_engine import ColorEngine

logger = logging.getLogger(__name__)


class FilterContext:
    """Parameters that guide filtering across all engines."""

    def __init__(
        self,
        *,
        temperature: Optional[str] = None,
        season: Optional[str] = None,
        wardrobe_gender: Optional[str] = None,
        occasion: Optional[str] = None,
        outfit_category: Optional[str] = None,
        excluded_item_ids: Optional[list[str]] = None,
    ) -> None:
        self.temperature = temperature
        self.season = season
        self.wardrobe_gender = wardrobe_gender
        self.occasion = occasion
        self.outfit_category = outfit_category
        self.excluded_item_ids = set(excluded_item_ids or [])


class FilterResult:
    """The result of running the filter pipeline."""

    def __init__(
        self,
        items: list[dict],
        partitioned: dict[str, list[dict]],
        metadata: dict,
    ) -> None:
        self.items = items
        self.partitioned = partitioned
        self.total_input = metadata.get("total_input", 0)
        self.total_filtered = metadata.get("total_filtered", 0)
        self.stage_counts = metadata.get("stage_counts", {})


class FilterEngine:
    """Deterministic clothing item filter pipeline.

    Chains weather, season, wardrobe, occasion, and category engines
    to eliminate invalid items before outfit selection. All engines
    are stateless — a single ``FilterEngine`` instance can be reused.
    """

    def __init__(self) -> None:
        self.weather_engine = WeatherEngine()
        self.season_engine = SeasonEngine()
        self.wardrobe_engine = WardrobeEngine()
        self.occasion_engine = OccasionEngine()
        self.category_engine = CategoryEngine()
        self.compatibility_engine = CompatibilityEngine()
        self.color_engine = ColorEngine()

    def filter(self, items: list[dict], context: FilterContext) -> FilterResult:
        """Run the full filtering pipeline.

        Args:
            items: Raw clothing item dicts from wardrobe.
            context: ``FilterContext`` with all filter parameters.

        Returns:
            ``FilterResult`` with filtered items, partitioned by
            canonical category, and stage-count metadata.
        """
        total = len(items)
        stage_counts: dict[str, int] = {}
        current = list(items)

        # 1. Exclude explicitly removed items.
        if context.excluded_item_ids:
            current = [i for i in current if i["id"] not in context.excluded_item_ids]
        stage_counts["exclude"] = len(current)

        # 2. Weather filter.
        current = self.weather_engine.filter(current, context.temperature)
        stage_counts["weather"] = len(current)

        # 3. Season filter.
        current = self.season_engine.filter(current, context.season)
        stage_counts["season"] = len(current)

        # 4. Wardrobe gender filter.
        current = self.wardrobe_engine.filter(current, context.wardrobe_gender)
        stage_counts["wardrobe"] = len(current)

        # 5. Occasion filter.
        current = self.occasion_engine.filter(current, context.occasion)
        stage_counts["occasion"] = len(current)

        # 6. Partition by canonical category.
        partitioned = self.category_engine.partition_items(current)

        logger.debug(
            "Filter pipeline: %d → %d items (weather=%d, season=%d, "
            "wardrobe=%d, occasion=%d)",
            total, len(current),
            stage_counts.get("weather", 0),
            stage_counts.get("season", 0),
            stage_counts.get("wardrobe", 0),
            stage_counts.get("occasion", 0),
        )

        return FilterResult(
            items=current,
            partitioned=partitioned,
            metadata={
                "total_input": total,
                "total_filtered": len(current),
                "stage_counts": stage_counts,
            },
        )

    def score_season_for_items(
        self,
        items: list[dict],
        season: Optional[str],
    ) -> dict[str, float]:
        """Return per-item season fit scores.

        Args:
            items: Clothing item dicts.
            season: Target season.

        Returns:
            Dict mapping ``item_id → score`` (0.0–1.0).
        """
        return {
            item["id"]: self.season_engine.score_item(item, season)
            for item in items
            if "id" in item
        }

    def score_compatibility_for_outfit(self, items: list[dict]) -> float:
        """Score the compatibility of items in a single outfit.

        Args:
            items: Clothing item dicts forming an outfit.

        Returns:
            Score 0.0–1.0.
        """
        return self.compatibility_engine.score_outfit(items)

    def score_colors_for_outfit(self, items: list[dict]) -> float:
        """Score the color harmony of items in a single outfit.

        Args:
            items: Clothing item dicts forming an outfit.

        Returns:
            Score 0.0–1.0.
        """
        return self.color_engine.score_outfit(items)

    def validate_outfit_slots(
        self,
        items: list[dict],
        outfit_category: str,
    ) -> bool:
        """Check if items satisfy category slot requirements.

        Args:
            items: Clothing item dicts to validate.
            outfit_category: Target outfit category.

        Returns:
            ``True`` if valid.
        """
        return self.category_engine.validate_outfit_slots(items, outfit_category)
