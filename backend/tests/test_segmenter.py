import io
import sys
from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

from app.services.segmentation.rembg_segmenter import RembgSegmenter


class FakeRemBgModule:
    """Mock rembg module injected into sys.modules so imports don't fail."""

    remove = MagicMock()
    new_session = MagicMock()


sys.modules["rembg"] = FakeRemBgModule


def _image_bytes(size: tuple[int, int] = (64, 64), color: tuple[int, int, int] = (200, 30, 30)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format="JPEG")
    return buf.getvalue()


def _rgba_output() -> Image.Image:
    """Create a mock RGBA output with a visible foreground region (center circle alpha=255)."""
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    pixels = img.load()
    cx, cy = 32, 32
    for y in range(64):
        for x in range(64):
            if (x - cx) ** 2 + (y - cy) ** 2 < 20**2:
                pixels[x, y] = (200, 30, 30, 255)
    return img


def _fully_transparent_rgba() -> Image.Image:
    return Image.new("RGBA", (64, 64), (0, 0, 0, 0))


class TestRembgSegmenter:
    def test_empty_bytes_raises_valueerror(self) -> None:
        segmenter = RembgSegmenter()
        with pytest.raises(ValueError, match="Cannot decode"):
            segmenter.segment(b"")

    def test_corrupt_bytes_raises_valueerror(self) -> None:
        segmenter = RembgSegmenter()
        with pytest.raises(ValueError, match="Cannot decode"):
            segmenter.segment(b"not an image")

    def test_happy_path(self) -> None:
        mock_rgba = _rgba_output()
        FakeRemBgModule.remove.return_value = mock_rgba
        FakeRemBgModule.new_session.return_value = MagicMock()

        segmenter = RembgSegmenter()
        result = segmenter.segment(_image_bytes())

        assert result.model_name == "rembg-u2net"
        assert result.segmented_bytes is not None
        assert result.mask_bytes is not None

        segmented = Image.open(io.BytesIO(result.segmented_bytes))
        assert segmented.mode == "RGBA"
        assert segmented.size == (64, 64)

        mask = Image.open(io.BytesIO(result.mask_bytes))
        assert mask.mode == "L"

    def test_rembg_exception_falls_back(self) -> None:
        FakeRemBgModule.remove.side_effect = RuntimeError("model crash")

        segmenter = RembgSegmenter()
        result = segmenter.segment(_image_bytes())

        assert result.model_name in ("PIL-Threshold-Fallback", "original-passthrough")
        assert result.segmented_bytes is not None

        segmented = Image.open(io.BytesIO(result.segmented_bytes))
        assert segmented.mode == "RGBA"

        mask = Image.open(io.BytesIO(result.mask_bytes))
        assert mask.mode == "L"

        total = segmented.size[0] * segmented.size[1]
        alpha_hist = segmented.getchannel("A").histogram()
        transparent_pixels = sum(alpha_hist[0:129])
        assert transparent_pixels < total

    def test_solid_black_never_fully_transparent(self) -> None:
        """
        A solid-color image triggers the degenerate mask guard.
        The segmenter must degrade through fallback → passthrough
        but NEVER emit a fully transparent PNG.
        """
        FakeRemBgModule.remove.return_value = _fully_transparent_rgba()
        FakeRemBgModule.new_session.return_value = MagicMock()
        FakeRemBgModule.remove.side_effect = None

        segmenter = RembgSegmenter()
        result = segmenter.segment(_image_bytes(color=(0, 0, 0)))

        segmented = Image.open(io.BytesIO(result.segmented_bytes))
        assert segmented.mode == "RGBA"

        total = segmented.size[0] * segmented.size[1]
        alpha_hist = segmented.getchannel("A").histogram()
        transparent_pixels = sum(alpha_hist[0:129])

        assert transparent_pixels < total

    def test_rembg_fully_transparent_triggers_fallback(self) -> None:
        """A fully transparent rembg result (coverage=0) triggers the fallback path."""
        FakeRemBgModule.remove.return_value = _fully_transparent_rgba()
        FakeRemBgModule.new_session.return_value = MagicMock()
        FakeRemBgModule.remove.side_effect = None

        segmenter = RembgSegmenter()
        result = segmenter.segment(_image_bytes(color=(50, 100, 150)))

        assert result.model_name != "rembg-u2net"
        assert result.model_name in ("PIL-Threshold-Fallback", "original-passthrough")

        segmented = Image.open(io.BytesIO(result.segmented_bytes))
        assert segmented.mode == "RGBA"

        total = segmented.size[0] * segmented.size[1]
        alpha_hist = segmented.getchannel("A").histogram()
        transparent_pixels = sum(alpha_hist[0:129])
        assert transparent_pixels < total

    def test_warmup_does_not_crash(self) -> None:
        FakeRemBgModule.new_session.return_value = MagicMock()
        FakeRemBgModule.new_session.side_effect = None

        segmenter = RembgSegmenter()
        # warmup should not raise, even if model loading fails
        segmenter.warmup()

    def test_warmup_survives_failure(self) -> None:
        FakeRemBgModule.new_session.side_effect = RuntimeError("download failed")

        segmenter = RembgSegmenter()
        # must not raise
        segmenter.warmup()
