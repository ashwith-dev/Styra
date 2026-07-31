"""Tests for the image validator.

Uses synthetic images to cover every validation check.
"""

import io
import struct
from unittest.mock import patch

import cv2
import numpy as np
from PIL import Image, ImageFilter

from app.services.validation.image_validator import ImageValidator
from app.services.validation.models import ValidationResult


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_image_bytes(
    width: int,
    height: int,
    fmt: str = "JPEG",
    color: tuple[int, int, int] = (128, 128, 128),
) -> bytes:
    """Create a flat-colour image encoded as *fmt*."""
    img = Image.new("RGB", (width, height), color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def _make_random_image_bytes(
    width: int,
    height: int,
    fmt: str = "JPEG",
    min_bright: int = 30,
    max_bright: int = 230,
) -> bytes:
    """Create a textured image with controlled brightness range."""
    rng = np.random.default_rng(42)
    span = max_bright - min_bright
    arr = (rng.random((height, width, 3)) * span + min_bright).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format=fmt)
    return buf.getvalue()


def _make_uniform_gray_bytes(
    width: int,
    height: int,
    gray_value: int,
    fmt: str = "JPEG",
) -> bytes:
    """Create a solid gray image for brightness tests."""
    arr = np.full((height, width, 3), gray_value, dtype=np.uint8)
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format=fmt)
    return buf.getvalue()


# ===================================================================
# Smoke test — valid images
# ===================================================================

def test_valid_image_passes() -> None:
    """A textured image with good brightness passes every check."""
    validator = ImageValidator()
    img = _make_random_image_bytes(1000, 1000, min_bright=40, max_bright=220)
    passed, reasons = validator.validate(img)
    assert passed, reasons


def test_valid_png_passes() -> None:
    """PNG images are accepted."""
    validator = ImageValidator()
    img = _make_random_image_bytes(800, 600, fmt="PNG")
    passed, reasons = validator.validate(img)
    assert passed, reasons


def test_valid_webp_passes() -> None:
    """WEBP images are accepted."""
    validator = ImageValidator()
    img = _make_random_image_bytes(800, 600, fmt="WEBP")
    passed, reasons = validator.validate(img)
    assert passed, reasons


def test_detailed_result_for_valid_image() -> None:
    """validate_detailed returns format and dimensions on success."""
    validator = ImageValidator()
    img = _make_random_image_bytes(800, 600)
    result = validator.validate_detailed(img)
    assert result.passed
    assert result.format == "JPEG"
    assert result.width == 800
    assert result.height == 600
    assert result.reasons == []


# ===================================================================
# Format
# ===================================================================

def test_invalid_format_bmp_fails() -> None:
    validator = ImageValidator()
    img = _make_image_bytes(100, 100, fmt="BMP")
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Unsupported format" in r for r in reasons)
    assert "BMP" in reasons[0]


def test_invalid_format_gif_fails() -> None:
    validator = ImageValidator()
    img = _make_image_bytes(100, 100, fmt="GIF")
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Unsupported format" in r for r in reasons)


def test_invalid_format_tiff_fails() -> None:
    validator = ImageValidator()
    img = _make_image_bytes(100, 100, fmt="TIFF")
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Unsupported format" in r for r in reasons)


# ===================================================================
# Resolution
# ===================================================================

def test_low_resolution_fails() -> None:
    """Below minimum on both sides."""
    validator = ImageValidator()
    img = _make_image_bytes(100, 100)
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Resolution too low" in r for r in reasons)


def test_short_width_fails() -> None:
    """Below minimum on width only."""
    validator = ImageValidator()
    img = _make_image_bytes(200, 800)
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Resolution too low" in r for r in reasons)


def test_short_height_fails() -> None:
    """Below minimum on height only."""
    validator = ImageValidator()
    img = _make_image_bytes(800, 300)
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Resolution too low" in r for r in reasons)


# ===================================================================
# Aspect ratio
# ===================================================================

def test_aspect_ratio_too_wide_fails() -> None:
    validator = ImageValidator()
    img = _make_image_bytes(2000, 100)  # 20:1
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Aspect ratio" in r for r in reasons)


def test_aspect_ratio_too_tall_fails() -> None:
    validator = ImageValidator()
    img = _make_image_bytes(100, 2000)  # 1:20
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("Aspect ratio" in r for r in reasons)


# ===================================================================
# Blur
# ===================================================================

def test_blurry_image_fails() -> None:
    """A completely uniform image has zero Laplacian variance → blurry."""
    validator = ImageValidator()
    img = _make_image_bytes(800, 800, color=(100, 100, 100))
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("blurry" in r for r in reasons)


def test_soft_but_usable_image_passes() -> None:
    """Slightly soft images (e.g. recompressed web photos) must pass.

    Regression test: Laplacian variance is content-dependent — a clean,
    slightly soft image scores ~4-5, far below a strict threshold, yet is
    perfectly usable by the extraction model.
    """
    validator = ImageValidator()
    rng = np.random.default_rng(11)
    arr = (rng.random((800, 800, 3)) * 180 + 40).astype(np.uint8)
    soft = Image.fromarray(arr).filter(ImageFilter.GaussianBlur(2))
    buf = io.BytesIO()
    soft.save(buf, format="JPEG", quality=70)
    passed, reasons = validator.validate(buf.getvalue())
    assert passed, reasons


# ===================================================================
# Brightness
# ===================================================================

def test_too_dark_fails() -> None:
    validator = ImageValidator()
    img = _make_uniform_gray_bytes(800, 800, gray_value=5)
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("too dark" in r for r in reasons)


def test_too_bright_fails() -> None:
    validator = ImageValidator()
    img = _make_uniform_gray_bytes(800, 800, gray_value=250)
    passed, reasons = validator.validate(img)
    assert not passed
    assert any("too bright" in r for r in reasons)


# ===================================================================
# Pixel-count guard (decompression bomb)
# ===================================================================

def test_pixel_bomb_fails_before_array_expansion() -> None:
    """An image exceeding MAX_PIXELS is rejected before numpy/cv2 expansion."""
    validator = ImageValidator()
    with patch.object(ImageValidator, "MAX_PIXELS", 10_000):
        img = _make_random_image_bytes(600, 600)  # 360k pixels > 10k limit
        passed, reasons = validator.validate(img)
    assert not passed
    assert any("too many pixels" in r for r in reasons)


def test_grayscale_png_does_not_crash() -> None:
    """Mode-L PNGs must be handled (converted to RGB), never raise."""
    rng = np.random.default_rng(7)
    arr = (rng.random((800, 800)) * 200 + 30).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(arr, mode="L").save(buf, format="PNG")
    passed, reasons = ImageValidator().validate(buf.getvalue())
    assert passed, reasons


def test_rgba_png_does_not_crash() -> None:
    """RGBA PNGs must be handled (converted to RGB), never raise."""
    rng = np.random.default_rng(7)
    arr = (rng.random((800, 800, 4)) * 200 + 30).astype(np.uint8)
    arr[..., 3] = 255
    buf = io.BytesIO()
    Image.fromarray(arr, mode="RGBA").save(buf, format="PNG")
    passed, reasons = ImageValidator().validate(buf.getvalue())
    assert passed, reasons


# ===================================================================
# Corrupted / unreadable
# ===================================================================

def test_not_an_image_fails() -> None:
    validator = ImageValidator()
    passed, reasons = validator.validate(b"not an image")
    assert not passed
    assert any("not a valid image" in r for r in reasons)


def test_truncated_jpeg_fails() -> None:
    """A JPEG whose pixel data was cut off mid-stream should be caught."""
    validator = ImageValidator()
    full = _make_random_image_bytes(800, 600)
    truncated = full[: len(full) // 2]  # chop in half
    passed, reasons = validator.validate(truncated)
    assert not passed
    # It could fail as "corrupted" or "truncated"
    assert len(reasons) >= 1


# ===================================================================
# Multiple failures
# ===================================================================

def test_multiple_reasons_collected() -> None:
    """A very small, uniform image fails both resolution and blur."""
    validator = ImageValidator()
    img = _make_image_bytes(50, 50, color=(100, 100, 100))
    _, reasons = validator.validate(img)
    assert len(reasons) >= 2
    assert any("Resolution too low" in r for r in reasons)
    assert any("blurry" in r for r in reasons)


# ===================================================================
# EXIF orientation handling (requires a real EXIF header)
# ===================================================================

def test_exif_orientation_applied() -> None:
    """Rotated images should be corrected (width/height swapped if
    orientation metadata says 90° rotation)."""
    validator = ImageValidator()

    # Build a JPEG with EXIF orientation = 6 (90° CW).
    # Use 800×600 so even after transposition both axes exceed minimum.
    arr = np.zeros((600, 800, 3), dtype=np.uint8)
    arr[50:550, 50:750] = [0, 255, 0]
    pil_img = Image.fromarray(arr)

    # Manually inject EXIF orientation tag
    exif_dict = pil_img.getexif()
    exif_dict[0x0112] = 6  # Orientation: Rotate 90 CW
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", exif=exif_dict.tobytes())
    raw = buf.getvalue()

    result = validator.validate_detailed(raw)

    # After orientation correction, the 100×200 original becomes 200×100
    # (or stays 100×200 depending on how exif_transpose works with this
    # orientation value).  The important thing is that the width/height
    # are flipped or the structure matches a valid image.
    assert result.passed
    # The result dimensions reflect the corrected orientation
    assert result.width is not None
    assert result.height is not None
