"""Tests for RMBGSegmenter: output handling, edge cases, and error modes.

The transformers pipeline is mocked so tests run without a GPU or model download.
"""

import io

import pytest
from PIL import Image

from app.services.segmentation.rmbg_segmenter import (
    RMBGSegmenter,
    SegmentedImageTooSmallError,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _image_bytes(size: tuple[int, int] = (64, 64)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (200, 30, 30)).save(buf, format="JPEG")
    return buf.getvalue()


def _fake_pipe(outputs):
    """Return a callable that returns *outputs* no matter the input."""
    return lambda _img: outputs


def _mask(size: tuple[int, int], value: int = 255) -> Image.Image:
    return Image.new("L", size, value)


# ===================================================================
# Smoke test — happy path
# ===================================================================

def test_segment_handles_list_output() -> None:
    """transformers image-segmentation returns a list of {label, score, mask}."""
    mask = _mask((64, 64), 255)
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([
        {"label": "background", "score": 0.1, "mask": _mask((64, 64), 10)},
        {"label": "garment", "score": 0.9, "mask": mask},
    ])

    result = segmenter.segment(_image_bytes())

    segmented = Image.open(io.BytesIO(result.segmented_bytes))
    assert segmented.mode == "RGBA", "segmented image must have alpha channel"
    assert segmented.size == (64, 64)
    assert result.model_name == "briaai/RMBG-1.4"
    # Highest-scoring mask was selected, so alpha is fully opaque
    assert segmented.getchannel("A").getextrema() == (255, 255)
    # mask bytes are a valid PNG image
    Image.open(io.BytesIO(result.mask_bytes)).verify()


# ===================================================================
# Edge cases — model output
# ===================================================================

def test_segment_raises_on_empty_output() -> None:
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([])
    with pytest.raises(ValueError, match="no output"):
        segmenter.segment(_image_bytes())


def test_segment_raises_on_none_output() -> None:
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe(None)
    with pytest.raises(TypeError, match="list"):
        segmenter.segment(_image_bytes())


def test_segment_raises_on_missing_mask_key() -> None:
    """Output dict without 'mask' key is caught."""
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([
        {"label": "garment", "score": 0.9},  # no "mask" key
    ])
    with pytest.raises(ValueError, match="missing 'mask'"):
        segmenter.segment(_image_bytes())


def test_segment_raises_on_wrong_mask_type() -> None:
    """mask value that isn't a PIL Image is caught."""
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([
        {"label": "garment", "score": 0.9, "mask": "not-an-image"},
    ])
    with pytest.raises(TypeError, match="PIL Image"):
        segmenter.segment(_image_bytes())


# ===================================================================
# Mask resizing
# ===================================================================

def test_segment_resizes_mismatched_mask() -> None:
    """Model returned a 16×16 mask for a 64×64 input — should be upscaled."""
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([
        {"label": "garment", "score": 0.9, "mask": _mask((16, 16), 128)},
    ])
    result = segmenter.segment(_image_bytes())
    assert Image.open(io.BytesIO(result.segmented_bytes)).size == (64, 64)


# ===================================================================
# Error handling — invalid inputs
# ===================================================================

def test_segment_raises_on_corrupted_bytes() -> None:
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([])  # won't be called
    with pytest.raises(ValueError, match="Cannot decode"):
        segmenter.segment(b"not an image")


def test_segment_raises_on_empty_bytes() -> None:
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([])
    with pytest.raises(ValueError, match="Cannot decode"):
        segmenter.segment(b"")


# ===================================================================
# Transparent PNG output
# ===================================================================

def test_segmented_output_is_transparent_png() -> None:
    """Background area in the mask should produce transparent alpha."""
    segmenter = RMBGSegmenter()
    # Mask with a 10×10 solid center on a 64×64 image
    mask = _mask((64, 64), 0)  # fully transparent
    segmenter._pipe = _fake_pipe([
        {"label": "garment", "score": 1.0, "mask": mask},
    ])

    result = segmenter.segment(_image_bytes())
    segmented = Image.open(io.BytesIO(result.segmented_bytes))

    assert segmented.mode == "RGBA"
    alpha = segmented.getchannel("A")
    # All pixels are transparent since the mask is all zeros
    assert alpha.getextrema() == (0, 0), "fully transparent mask → all transparent"


def test_segmented_preserves_rgb_channels() -> None:
    """RGB pixel values from the original must survive alpha application.

    Uses PNG source to avoid lossy-JPEG compression shifting values.
    """
    segmenter = RMBGSegmenter()
    mask = _mask((64, 64), 255)
    segmenter._pipe = _fake_pipe([
        {"label": "garment", "score": 1.0, "mask": mask},
    ])

    # PNG source so pixel values are exact
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), (200, 30, 30)).save(buf, format="PNG")

    result = segmenter.segment(buf.getvalue())
    segmented = Image.open(io.BytesIO(result.segmented_bytes))

    px = segmented.getpixel((0, 0))
    assert px[:3] == (200, 30, 30), f"RGB values corrupted: got {px[:3]}"


# ===================================================================
# Degenerate mask
# ===================================================================

def test_segment_raises_on_tiny_mask() -> None:
    """A 2×2 mask should be rejected as degenerate."""
    segmenter = RMBGSegmenter()
    segmenter._pipe = _fake_pipe([
        {"label": "garment", "score": 0.9, "mask": _mask((2, 2), 128)},
    ])
    with pytest.raises(SegmentedImageTooSmallError):
        segmenter.segment(_image_bytes())
