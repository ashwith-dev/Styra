"""Deterministic attribute-based embedder (no external model calls).

Builds a 512-dim L2-normalized hashed bag-of-features vector from the
item's canonical attribute values (category, type, color, pattern,
material, style, season, occasion). Cosine similarity between two items
therefore reflects how many attributes they share — which is exactly
what ``match_compatible_items`` ranks on.

Swap in a real model (e.g. CLIP ViT-B/32, also 512-dim) by implementing
``BaseEmbedder`` — the schema and RPC stay unchanged.
"""

import hashlib
import math
from typing import Any, Optional

from app.services.embedding.base import BaseEmbedder, EMBEDDING_DIM

_SCALAR_FIELDS = ("category", "type", "color", "pattern", "material", "style")
_LIST_FIELDS = ("season", "occasion")


class AttributeEmbedder(BaseEmbedder):
    def embed_attributes(self, attributes: dict) -> Optional[list[float]]:
        tokens = self._tokens(attributes)
        if not tokens:
            return None

        vec = [0.0] * EMBEDDING_DIM
        for token in tokens:
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest()
            idx = int.from_bytes(digest[:4], "little") % EMBEDDING_DIM
            sign = 1.0 if digest[4] & 1 else -1.0
            vec[idx] += sign

        norm = math.sqrt(sum(v * v for v in vec))
        if norm == 0.0:
            return None
        return [round(v / norm, 6) for v in vec]

    @staticmethod
    def _value(attr: Any) -> Optional[str]:
        """Pull a plain string out of an AttributeConfidence-shaped value."""
        if isinstance(attr, dict):
            attr = attr.get("value")
        if isinstance(attr, str) and attr.strip():
            return attr.strip().lower()
        return None

    @classmethod
    def _tokens(cls, attributes: dict) -> list[str]:
        tokens: list[str] = []
        for field in _SCALAR_FIELDS:
            val = cls._value(attributes.get(field))
            if val:
                tokens.append(f"{field}:{val}")
        for field in _LIST_FIELDS:
            entries = attributes.get(field) or []
            if isinstance(entries, list):
                for entry in entries:
                    val = cls._value(entry)
                    if val:
                        tokens.append(f"{field}:{val}")
        return tokens
