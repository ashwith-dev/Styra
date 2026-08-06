"""Gemini outfit selection provider.

Implements the ``LLMProvider`` interface using Gemini's native API
(not OpenRouter). Handles timeouts, retries, and graceful fallback.
"""

import asyncio
import json
import logging
from typing import Any, Optional

import httpx

from app.config import settings
from app.ai.interfaces.llm_provider import LLMProvider
from app.ai.models.outfit_request import OutfitRequest
from app.ai.models.outfit_response import OutfitResponse
from app.ai.utils.exceptions import LLMProviderError
from app.services.http_client import get_http_client

logger = logging.getLogger(__name__)

_MAX_RETRIES = 2
# Exponential backoff between attempts (immediate retries are useless
# against rate limits).
_RETRY_BACKOFF_SECONDS = (0.5, 1.5)
_GEMINI_URL_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent"
)


class GeminiProvider(LLMProvider):
    """Gemini Flash outfit selector via Google's native Gemini API.

    Does NOT generate outfits — only selects the best candidate from
    the provided ``CandidateSet``. Async-first to match the existing
    pipeline pattern. Reuses the application-wide ``httpx.AsyncClient``
    for connection pooling.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ) -> None:
        self._api_key = api_key or settings.gemini_api_key
        self._model = model or settings.gemini_model

    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    async def select_outfit(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:
        if not self._api_key or not self._api_key.strip():
            raise LLMProviderError("No Gemini API key configured")

        url = _GEMINI_URL_TEMPLATE.format(model=self._model)
        # Key in the header, not the URL query string (query params end
        # up in proxy/access logs).
        headers = {"x-goog-api-key": self._api_key}

        system_instruction = (
            {"parts": [{"text": system_prompt}]}
            if system_prompt
            else None
        )

        body: dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json",
            },
        }
        if system_instruction:
            body["systemInstruction"] = system_instruction

        last_error: Optional[Exception] = None
        for attempt in range(1 + _MAX_RETRIES):
            if attempt > 0:
                await asyncio.sleep(_RETRY_BACKOFF_SECONDS[attempt - 1])
            try:
                resp = await get_http_client().post(
                    url,
                    headers=headers,
                    json=body,
                )
            except httpx.RequestError as exc:
                last_error = exc
                if attempt < _MAX_RETRIES:
                    logger.warning(
                        "Gemini request attempt %d failed: %s", attempt + 1, exc
                    )
                    continue
                raise LLMProviderError(
                    f"Gemini API request failed: {exc}"
                ) from exc

            if resp.status_code in (429, 503):
                logger.warning(
                    "Gemini returned %d (attempt %d); retrying",
                    resp.status_code,
                    attempt + 1,
                )
                last_error = Exception(f"Gemini returned {resp.status_code}")
                if attempt < _MAX_RETRIES:
                    continue
                raise LLMProviderError(f"Gemini API returned {resp.status_code}")

            if resp.status_code != 200:
                body_text = resp.text[:500]
                raise LLMProviderError(
                    f"Gemini API returned {resp.status_code}: {body_text}"
                )

            return self._parse_response(resp.json())

        raise LLMProviderError(
            f"Gemini API failed after {_MAX_RETRIES + 1} attempts: {last_error}"
        )

    def _parse_response(self, data: dict[str, Any]) -> dict[str, Any]:
        """Extract and parse JSON from the native Gemini API response.

        Gemini returns ``candidates[0].content.parts[0].text`` unlike
        the OpenAI-compatible ``choices[0].message.content``.
        """
        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError) as exc:
            raise LLMProviderError(
                f"Unexpected Gemini response structure: {exc}"
            ) from exc

        content = content.strip()

        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines)

        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise LLMProviderError(
                f"Gemini returned unparseable JSON: {exc}. "
                f"Raw response (first 300 chars): {content[:300]}"
            ) from exc

    # ── LLMProvider interface ──

    async def generate_outfits(self, request: OutfitRequest) -> OutfitResponse:
        raise NotImplementedError(
            "GeminiProvider does not generate outfits from scratch. "
            "Use RankingEngine + GeminiStylist instead."
        )

    def explain_outfit(self, outfit_id: str, context: dict) -> str:
        raise NotImplementedError(
            "Use GeminiStylist for outfit selection with explanation."
        )
