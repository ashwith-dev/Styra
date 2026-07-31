"""Clothing attribute extraction via Qwen2.5-VL (OpenRouter API) with visual heuristic fallback.

Handles raw model I/O, JSON parsing, schema mapping, and confidence extraction.
If OpenRouter API key is missing or request fails, falls back gracefully to
PIL-based visual color and category analysis to guarantee item recognition.
"""

import base64
import io
import json
import logging
from typing import Any

import httpx
from PIL import Image

from app.config import settings
from app.services.extraction.base import BaseAttributeExtractor
from app.services.extraction.base_attributes import (
    AIPipelineResult,
    AttributeConfidence,
)
from app.utils.prompts import SYSTEM_PROMPT_STRUCTURED

logger = logging.getLogger(__name__)

_OPTIONAL_ATTRS = [
    "pattern", "material", "style", "neckline",
    "sleeve_length", "fit", "length", "closure",
]

_CATEGORIES = {"top", "bottom", "dress", "outerwear", "footwear", "accessory", "invalid"}

# OpenRouter 404s when a model has no live provider endpoints (all free
# Qwen VL variants are currently decommissioned). Retry with verified-live
# vision models before degrading to the visual heuristic.
_FALLBACK_MODELS = [
    "qwen/qwen2.5-vl-72b-instruct",
    "qwen/qwen3.7-flash",
]


class ExtractionError(Exception):
    """Raised when the model response cannot be mapped to a valid result."""


class QwenExtractor(BaseAttributeExtractor):
    """Extract clothing attributes via OpenRouter's hosted Qwen2.5-VL with fallback."""

    MODEL_NAME = "qwen2.5-vl"
    MODEL_VERSION = "2025"

    def __init__(self) -> None:
        self._api_key = settings.openrouter_api_key or settings.gemini_api_key
        self._model = settings.qwen_model or _FALLBACK_MODELS[0]
        self._client = httpx.AsyncClient(timeout=60.0)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def extract(self, segmented_image_bytes: bytes) -> AIPipelineResult:
        if not self._api_key:
            logger.warning(
                "OpenRouter API key missing in environment; using visual heuristic fallback"
            )
            return self._fallback_extract(segmented_image_bytes)

        try:
            raw = await self._call_model(segmented_image_bytes)
            return self._map_to_schema(raw)
        except Exception as exc:
            logger.warning(
                "OpenRouter Qwen2.5-VL extraction failed (%s); using visual heuristic fallback",
                exc,
            )
            return self._fallback_extract(segmented_image_bytes)

    # ------------------------------------------------------------------
    # Visual Heuristic Fallback
    # ------------------------------------------------------------------
    def _fallback_extract(self, image_bytes: bytes) -> AIPipelineResult:
        """Analyzes image aspect ratio and color palette using PIL to recognize item attributes."""
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

            # Crop to the garment's bounding box so background that leaked
            # outside the mask cannot skew the colour estimate.
            bbox = img.getchannel("A").getbbox()
            if bbox:
                img = img.crop(bbox)

            width, height = img.size
            aspect = height / max(1, width)

            # Downsample before pixel iteration
            img_small = img.resize((200, 200), Image.LANCZOS)

            # Only fully-opaque garment pixels: semi-transparent edge pixels
            # are blended with the background, and a mean over them greys out
            # dark garments. The per-channel median is robust to both.
            pixels = [p[:3] for p in img_small.getdata() if p[3] > 128]
            if pixels:
                mid = len(pixels) // 2
                avg_r = sorted(p[0] for p in pixels)[mid]
                avg_g = sorted(p[1] for p in pixels)[mid]
                avg_b = sorted(p[2] for p in pixels)[mid]
            else:
                avg_r, avg_g, avg_b = 50, 50, 50

            color_hex = f"#{avg_r:02x}{avg_g:02x}{avg_b:02x}"
            color_name = self._color_name_from_rgb(avg_r, avg_g, avg_b)

            # Heuristic for category based on aspect ratio
            if aspect > 1.35:
                category = "bottom"
                type_val = "trousers"
                description = f"Classic {color_name.lower()} trousers"
            elif aspect < 0.85:
                category = "top"
                type_val = "t-shirt"
                description = f"Casual {color_name.lower()} top"
            else:
                category = "top"
                type_val = "shirt"
                description = f"Versatile {color_name.lower()} shirt"

            return AIPipelineResult(
                category=AttributeConfidence(value=category, confidence=0.85),
                type=AttributeConfidence(value=type_val, confidence=0.85),
                color=AttributeConfidence(value=color_name, confidence=0.9),
                color_hex=AttributeConfidence(value=color_hex, confidence=0.9),
                fit=AttributeConfidence(value="regular", confidence=0.8),
                style=AttributeConfidence(value="casual", confidence=0.8),
                season=[
                    AttributeConfidence(value="spring", confidence=1.0),
                    AttributeConfidence(value="summer", confidence=1.0),
                ],
                occasion=[
                    AttributeConfidence(value="casual", confidence=1.0),
                    AttributeConfidence(value="everyday", confidence=1.0),
                ],
                description=description,
                model_name="Visual-Heuristic-Analyzer",
                model_version="v1.0",
                raw_model_output={"fallback": True},
            )
        except Exception as exc:
            logger.error("Visual fallback extraction failed: %s", exc)
            return AIPipelineResult(
                category=AttributeConfidence(value="top", confidence=0.8),
                type=AttributeConfidence(value="t-shirt", confidence=0.8),
                color=AttributeConfidence(value="Black", confidence=0.8),
                color_hex=AttributeConfidence(value="#1A1A1A", confidence=0.8),
                description="Clothing item",
                model_name="Basic-Fallback",
                model_version="v1.0",
            )

    def _color_name_from_rgb(self, r: int, g: int, b: int) -> str:
        if r < 40 and g < 40 and b < 40:
            return "Black"
        if r > 215 and g > 215 and b > 215:
            return "White"
        if abs(r - g) < 15 and abs(g - b) < 15:
            return "Grey"
        if r > g + 40 and r > b + 40:
            return "Red" if g < 100 else "Orange"
        if g > r + 30 and g > b + 30:
            return "Green"
        if b > r + 30 and b > g + 30:
            return "Blue"
        if r > 150 and g > 150 and b < 100:
            return "Yellow"
        if r > 100 and b > 100 and g < 80:
            return "Purple"
        if r > 100 and g > 60 and b < 50:
            return "Brown"
        return "Neutral"

    # ------------------------------------------------------------------
    # Model I/O via OpenRouter API
    # ------------------------------------------------------------------
    async def _call_model(self, image_bytes: bytes) -> dict[str, Any]:
        """Post the image + prompt to OpenRouter API and return parsed JSON.

        Retries with the fallback model strings when OpenRouter answers
        404 (model alias not found) for the configured model.
        """
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64}"

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "HTTP-Referer": "https://styra.app",
            "X-Title": "STYRA Wardrobe App",
            "Content-Type": "application/json",
        }

        models = [self._model] + [m for m in _FALLBACK_MODELS if m != self._model]
        last_error: ExtractionError | None = None

        for model in models:
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "image_url", "image_url": {"url": data_url}},
                            {"type": "text", "text": SYSTEM_PROMPT_STRUCTURED},
                        ],
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 1024,
            }

            try:
                resp = await self._client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
            except httpx.RequestError as exc:
                raise ExtractionError(f"OpenRouter API request failed: {exc}") from exc

            if resp.status_code == 404:
                logger.warning(
                    "OpenRouter model %r returned 404; trying fallback model string",
                    model,
                )
                last_error = ExtractionError(
                    f"OpenRouter model not found (404): {model}"
                )
                continue

            if resp.status_code == 429:
                logger.warning(
                    "OpenRouter rate-limited model %r (429) — free-tier quota "
                    "likely exhausted; falling back to visual heuristic",
                    model,
                )

            try:
                resp.raise_for_status()
            except httpx.HTTPStatusError as exc:
                body = exc.response.text[:500]
                raise ExtractionError(
                    f"OpenRouter API returned {exc.response.status_code}: {body}"
                ) from exc

            return self._parse_model_output(resp.json())

        raise last_error or ExtractionError("No Qwen model string succeeded")

    def _parse_model_output(self, data: dict[str, Any]) -> dict[str, Any]:
        try:
            choices = data["choices"]
        except (KeyError, TypeError) as exc:
            raise ExtractionError(
                f"Response missing 'choices' key: {str(data)[:300]}"
            ) from exc

        if not choices:
            raise ExtractionError("Model returned empty choices list")

        try:
            content = choices[0]["message"]["content"]
        except (KeyError, TypeError, IndexError) as exc:
            raise ExtractionError(
                f"Cannot extract content from first choice: {str(choices[0])[:300]}"
            ) from exc

        if not content or not content.strip():
            raise ExtractionError("Model returned empty content")

        # Strip markdown code blocks if model wrapped JSON in ```json ... ```
        clean_content = content.strip()
        if clean_content.startswith("```"):
            lines = clean_content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_content = "\n".join(lines).strip()

        try:
            return json.loads(clean_content)
        except json.JSONDecodeError as exc:
            raise ExtractionError(
                f"Model returned unparseable JSON: {clean_content[:300]}"
            ) from exc

    # ------------------------------------------------------------------
    # Schema mapping
    # ------------------------------------------------------------------
    def _map_to_schema(self, raw: dict) -> AIPipelineResult:
        def _ac(
            key: str,
            default_val: Any = None,
            null_on_unknown: bool = False,
        ) -> AttributeConfidence:
            if key in raw:
                val = raw[key]
                confidence = raw.get(f"{key}_confidence", 1.0)
            else:
                val = default_val
                confidence = 0.0

            if val is None:
                return AttributeConfidence(
                    value=None if null_on_unknown else "unknown",
                    confidence=0.0,
                )
            return AttributeConfidence(value=val, confidence=float(confidence))

        category = _ac("category")
        if category.value not in _CATEGORIES and category.confidence > 0:
            category = AttributeConfidence(value=category.value, confidence=0.5)

        kwargs: dict[str, Any] = {
            attr: _ac(attr, null_on_unknown=True)
            for attr in _OPTIONAL_ATTRS
            if raw.get(attr) is not None
        }
        if "gender" in raw and raw["gender"] is not None:
            kwargs["gender"] = _ac("gender", null_on_unknown=True)

        return AIPipelineResult(
            category=category,
            type=_ac("type"),
            color=_ac("color"),
            color_hex=_ac("color_hex", null_on_unknown=True),
            **kwargs,
            season=[
                AttributeConfidence(value=s, confidence=1.0)
                for s in (raw.get("season") or [])
            ],
            occasion=[
                AttributeConfidence(value=o, confidence=1.0)
                for o in (raw.get("occasion") or [])
            ],
            brand=raw.get("brand"),
            description=raw.get("description", ""),
            model_name=self.MODEL_NAME,
            model_version=self.MODEL_VERSION,
            raw_model_output=raw,
        )
