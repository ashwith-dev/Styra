"""Tests for the deterministic AttributeEmbedder."""

import math

from app.services.embedding.attribute_embedder import AttributeEmbedder
from app.services.embedding.base import EMBEDDING_DIM


def _attrs(**overrides):
    base = {
        "category": {"value": "top", "confidence": 0.9},
        "type": {"value": "t-shirt", "confidence": 0.8},
        "color": {"value": "navy", "confidence": 0.7},
        "season": [{"value": "summer", "confidence": 1.0}],
    }
    base.update(overrides)
    return base


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))


def test_returns_512_dim_unit_vector() -> None:
    vec = AttributeEmbedder().embed_attributes(_attrs())
    assert vec is not None
    assert len(vec) == EMBEDDING_DIM
    assert math.isclose(sum(v * v for v in vec), 1.0, rel_tol=1e-3)


def test_deterministic() -> None:
    embedder = AttributeEmbedder()
    assert embedder.embed_attributes(_attrs()) == embedder.embed_attributes(_attrs())


def test_similar_items_rank_closer_than_dissimilar() -> None:
    embedder = AttributeEmbedder()
    a = embedder.embed_attributes(_attrs())
    similar = embedder.embed_attributes(_attrs(color={"value": "blue"}))
    different = embedder.embed_attributes(
        {
            "category": {"value": "footwear"},
            "type": {"value": "boots"},
            "color": {"value": "black"},
            "season": [{"value": "winter"}],
        }
    )
    assert _cosine(a, similar) > _cosine(a, different)


def test_handles_plain_strings_and_empty_input() -> None:
    embedder = AttributeEmbedder()
    vec = embedder.embed_attributes({"category": "top"})  # user-edited shape
    assert vec is not None and len(vec) == EMBEDDING_DIM
    assert embedder.embed_attributes({}) is None
    assert embedder.embed_attributes({"category": {"value": "  "}}) is None
