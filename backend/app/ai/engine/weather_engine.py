"""Weather engine — filters clothing by temperature conditions.

Deterministic: uses material preferences and layer limits from config.
"""

from typing import Optional

from app.ai.engine.rules_config import WEATHER_MATERIAL_PREFERENCES
from app.services.recommendations.rules import _attr_value, _norm


class WeatherEngine:
    """Filter clothing items according to weather conditions."""

    def filter(
        self,
        items: list[dict],
        temperature: Optional[str] = None,
    ) -> list[dict]:
        """Filter items by temperature-appropriate materials and layers.

        Args:
            items: List of clothing item dicts with ``attributes``.
            temperature: One of ``"hot"``, ``"warm"``, ``"mild"``,
                         ``"cool"``, ``"cold"``, or ``None`` to disable.

        Returns:
            Filtered list. Items without temperature-relevant attributes
            pass through unmodified.
        """
        if temperature is None:
            return list(items)

        rules = WEATHER_MATERIAL_PREFERENCES.get(_norm(temperature))
        if rules is None:
            return list(items)

        prefer = set(rules.get("prefer", []))
        avoid = set(rules.get("avoid", []))

        if not prefer and not avoid:
            return list(items)

        kept: list[dict] = []
        for item in items:
            material = self._extract_material(item)
            if avoid and material and material in avoid:
                continue
            kept.append(item)

        return kept

    def get_layer_guidance(self, temperature: Optional[str]) -> int:
        """Return the recommended maximum layer count for a temperature.

        Args:
            temperature: Temperature level or ``None``.

        Returns:
            Max layers; defaults to 4 when unknown.
        """
        if temperature is None:
            return 4
        rules = WEATHER_MATERIAL_PREFERENCES.get(_norm(temperature), {})
        return rules.get("max_layers", 4)

    @staticmethod
    def _extract_material(item: dict) -> Optional[str]:
        attrs = item.get("attributes", {})
        material = _attr_value(attrs, "material")
        if material:
            return _norm(material)
        return None
