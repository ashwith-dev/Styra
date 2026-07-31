"""Tests for GeminiExtractor: schema mapping, error handling, edge cases.

The actual HTTP API is never called — tests exercise ``_map_to_schema``
and response decoding with synthetic inputs.
"""

import json

import pytest

from app.services.extraction.qwen_extractor import (
    QwenExtractor,
    ExtractionError,
)
from app.services.extraction.base_attributes import AIPipelineResult


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def extractor() -> QwenExtractor:
    return QwenExtractor()


# ===================================================================
# Schema mapping — happy path
# ===================================================================

def test_map_full_response() -> None:
    """Every expected field is present in a full API response."""
    raw = {
        "category": "top",
        "type": "t-shirt",
        "color": "navy_blue",
        "color_hex": "#000080",
        "gender": "men",
        "pattern": "solid",
        "material": "cotton",
        "style": "casual",
        "neckline": "round",
        "sleeve_length": "short",
        "fit": "regular",
        "length": "hip",
        "closure": "pull_over",
        "season": ["spring", "summer"],
        "occasion": ["everyday"],
        "brand": None,
        "description": "A navy blue cotton t-shirt.",
        "category_confidence": 0.98,
        "type_confidence": 0.95,
        "color_confidence": 0.97,
        "gender_confidence": 0.6,
    }
    result = extractor()._map_to_schema(raw)

    assert result.category.value == "top"
    assert result.category.confidence == 0.98
    assert result.type.value == "t-shirt"
    assert result.color.value == "navy_blue"
    assert result.color_hex is not None
    assert result.color_hex.value == "#000080"
    assert result.gender is not None
    assert result.gender.value == "men"
    assert result.gender.confidence == 0.6
    assert result.pattern is not None
    assert result.pattern.value == "solid"
    assert len(result.season) == 2
    assert len(result.occasion) == 1
    assert result.brand is None
    assert result.description == "A navy blue cotton t-shirt."
    assert result.model_name == "qwen2.5-vl"


def test_map_partial_response() -> None:
    """Missing optional fields default to None with confidence 0.0."""
    raw = {
        "category": "bottom",
        "type": "jeans",
        "color": "blue",
        "description": "Blue jeans.",
    }
    result = extractor()._map_to_schema(raw)
    assert result.category.value == "bottom"
    assert result.type.value == "jeans"
    assert result.color.value == "blue"
    assert result.pattern is None
    assert result.gender is None
    assert result.season == []
    assert result.occasion == []


def test_map_minimal_response() -> None:
    """Even a bare response produces a valid AIPipelineResult."""
    raw = {"category": "accessory", "type": "watch", "color": "silver"}
    result = extractor()._map_to_schema(raw)
    assert result.category.value == "accessory"


# ===================================================================
# Confidence
# ===================================================================

def test_confidence_defaults_to_1_when_omitted() -> None:
    """When the model omits *_confidence, default to 1.0."""
    raw = {"category": "top", "type": "shirt", "color": "red"}
    result = extractor()._map_to_schema(raw)
    assert result.category.confidence == 1.0
    assert result.type.confidence == 1.0


def test_confidence_0_for_unknown() -> None:
    """Attributes with null value get confidence 0.0."""
    raw = {"category": "top", "type": "shirt", "color": None, "color_confidence": 0.0}
    result = extractor()._map_to_schema(raw)
    assert result.color.value == "unknown"
    assert result.color.confidence == 0.0


# ===================================================================
# Invalid category
# ===================================================================

def test_unknown_category_gets_lowered_confidence() -> None:
    """A category outside the known set has its confidence capped at 0.5."""
    raw = {"category": "underwear", "type": "boxers", "color": "black"}
    result = extractor()._map_to_schema(raw)
    assert result.category.value == "underwear"
    assert result.category.confidence == 0.5  # capped


# ===================================================================
# AIPipelineResult validation
# ===================================================================

def test_result_is_valid_pydantic_model() -> None:
    """_map_to_schema always returns a valid AIPipelineResult."""
    result = extractor()._map_to_schema({"category": "invalid", "type": "unknown"})
    assert isinstance(result, AIPipelineResult)
    # model_dump should round-trip
    dumped = result.model_dump(mode="json")
    restored = AIPipelineResult.model_validate(dumped)
    assert restored.category.value == "invalid"
