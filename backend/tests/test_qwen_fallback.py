"""Regression tests for the visual heuristic fallback extractor.

A black garment whose segmentation mask leaks semi-transparent background
must still be detected as Black — the old mean-over-all-pixels heuristic
averaged garment + background into grey.
"""

import io

from PIL import Image

from app.services.extraction.qwen_extractor import QwenExtractor


def _png_with_leaky_black_garment() -> bytes:
    """Opaque black garment surrounded by semi-transparent white pixels."""
    img = Image.new("RGBA", (120, 160), (255, 255, 255, 0))
    for y in range(160):
        for x in range(120):
            if 30 <= x < 90 and 10 <= y < 150:
                img.putpixel((x, y), (20, 20, 20, 255))
            elif 20 <= x < 100 and 5 <= y < 155:
                # leaky mask edge: background blended into the alpha channel
                img.putpixel((x, y), (230, 230, 230, 60))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_black_garment_with_mask_leakage_detected_as_black() -> None:
    result = QwenExtractor()._fallback_extract(_png_with_leaky_black_garment())

    assert result.color.value == "Black"
    assert result.color_hex.value is not None
    r = int(result.color_hex.value[1:3], 16)
    g = int(result.color_hex.value[3:5], 16)
    b = int(result.color_hex.value[5:7], 16)
    assert r < 60 and g < 60 and b < 60


def test_fallback_still_recognizes_category_from_aspect() -> None:
    result = QwenExtractor()._fallback_extract(_png_with_leaky_black_garment())

    # tall garment crop -> bottom
    assert result.category.value == "bottom"
    assert result.model_name == "Visual-Heuristic-Analyzer"
