"""Clothing attribute extraction via Qwen2.5-VL (Together AI).

Handles raw model I/O, JSON parsing, schema mapping, and confidence extraction.
Every failure path produces a meaningful error so the PipelineService can decide
how to surface it.
"""

import base64
import json
from typing import Any

import httpx

from app.config import settings
from app.services.extraction.base import BaseAttributeExtractor
from app.services.extraction.base_attributes import (
    AIPipelineResult,
    AttributeConfidence,
)
from app.utils.prompts import SYSTEM_PROMPT_STRUCTURED

_OPTIONAL_ATTRS = [
    "pattern", "material", "style", "neckline",
    "sleeve_length", "fit", "length", "closure",
]

_CATEGORIES = {"top", "bottom", "dress", "outerwear", "footwear", "accessory", "invalid"}


class ExtractionError(Exception):
    """Raised when the model response cannot be mapped to a valid result."""


class QwenExtractor(BaseAttributeExtractor):
    """Extract clothing attributes via Together AI's hosted Qwen2.5-VL.

    Swappable: the ``extract()`` contract matches ``BaseAttributeExtractor``,
    so a different model backend just needs a new subclass.
    """

    MODEL_NAME = "Qwen2.5-VL-3B-Instruct"
    MODEL_VERSION = "2025-07-01"

    def __init__(self) -> None:
        self._api_key = settings.together_api_key
        self._model = settings.qwen_model
        self._client = httpx.AsyncClient(timeout=60.0)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def extract(self, segmented_image_bytes: bytes) -> AIPipelineResult:
        raw = await self._call_model(segmented_image_bytes)
        return self._map_to_schema(raw)

    # ------------------------------------------------------------------
    # Model I/O
    # ------------------------------------------------------------------
    async def _call_model(self, image_bytes: bytes) -> dict[str, Any]:
        """Post the image + prompt to Together AI and return the parsed JSON."""
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64}"

        payload = {
            "model": self._model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {"type": "text", "text": SYSTEM_PROMPT_STRUCTURED},
                    ],
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
            "max_tokens": 1024,
        }

        try:
            resp = await self._client.post(
                "https://api.together.xyz/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        except httpx.RequestError as exc:
            raise ExtractionError(f"API request failed: {exc}") from exc

        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = exc.response.text[:500]
            raise ExtractionError(
                f"API returned {exc.response.status_code}: {body}"
            ) from exc

        data = resp.json()
        return self._parse_model_output(data)

    def _parse_model_output(self, data: dict[str, Any]) -> dict[str, Any]:
        """Extract the content JSON from the Together AI response wrapper.

        Handles missing keys, empty content, and invalid JSON.
        """
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

        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise ExtractionError(
                f"Model returned unparseable JSON: {content[:300]}"
            ) from exc

    # ------------------------------------------------------------------
    # Schema mapping
    # ------------------------------------------------------------------
    def _map_to_schema(self, raw: dict) -> AIPipelineResult:
        """Map the raw API response dict to a canonical ``AIPipelineResult``.

        Every attribute gets a confidence score; missing values default to
        confidence 0.0 (``unknown``).
        """
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
