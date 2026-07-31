from pydantic import BaseModel
from typing import Any, Optional


class AttributeConfidence(BaseModel):
    value: Any
    confidence: float  # 0.0–1.0


class AIPipelineResult(BaseModel):
    # --- Core attributes ---
    category: AttributeConfidence
    type: AttributeConfidence
    color: AttributeConfidence
    color_hex: Optional[AttributeConfidence] = None

    # --- New Core & Stylist attributes ---
    secondary_color: Optional[AttributeConfidence] = None
    secondary_color_hex: Optional[AttributeConfidence] = None
    size: Optional[AttributeConfidence] = None

    # --- Optional detail attributes ---
    pattern: Optional[AttributeConfidence] = None
    material: Optional[AttributeConfidence] = None
    style: Optional[AttributeConfidence] = None
    neckline: Optional[AttributeConfidence] = None
    sleeve_length: Optional[AttributeConfidence] = None
    fit: Optional[AttributeConfidence] = None
    length: Optional[AttributeConfidence] = None
    dress_length: Optional[AttributeConfidence] = None
    bottom_fit: Optional[AttributeConfidence] = None
    waist_rise: Optional[AttributeConfidence] = None
    heel_height: Optional[AttributeConfidence] = None
    warmth: Optional[AttributeConfidence] = None
    layer_type: Optional[AttributeConfidence] = None
    transparency: Optional[AttributeConfidence] = None
    stretch: Optional[AttributeConfidence] = None

    # --- Multi-value ---
    season: list[AttributeConfidence] = []
    occasion: list[AttributeConfidence] = []

    # --- Detection confidence ---
    gender: Optional[AttributeConfidence] = None

    # --- Free-text ---
    brand: Optional[str] = None
    description: str = ""

    # --- Metadata ---
    model_name: str = ""
    model_version: str = ""
    raw_model_output: Optional[dict] = None
