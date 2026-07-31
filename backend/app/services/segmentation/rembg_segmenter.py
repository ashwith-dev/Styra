import io
import logging

from PIL import Image, ImageChops

from app.services.segmentation.base import BaseSegmenter, SegmentationResult

logger = logging.getLogger(__name__)


class RembgSegmenter(BaseSegmenter):
    """Garment segmentation via rembg (U2-Net). Falls back to PIL thresholding on failure."""

    def __init__(self) -> None:
        self._session = None

    def segment(self, image_bytes: bytes) -> SegmentationResult:
        pil_image = self._open_image(image_bytes)

        try:
            self._lazy_load()
            from rembg import remove

            output = remove(pil_image, session=self._session)

            mask = output.getchannel("A")
            coverage = self._foreground_coverage(mask)

            if coverage < 0.02 or coverage > 0.98:
                logger.warning(
                    "rembg mask degenerate (coverage=%.3f). Falling back to threshold segmenter.",
                    coverage,
                )
                return self._fallback_segment(pil_image)

            seg_bytes = self._encode_png(output)
            mask_bytes = self._encode_png(mask)

            return SegmentationResult(
                segmented_bytes=seg_bytes,
                mask_bytes=mask_bytes,
                model_name="rembg-u2net",
            )
        except Exception as exc:
            logger.warning("rembg segmentation failed: %s. Falling back to threshold segmenter.", exc)
            return self._fallback_segment(pil_image)

    def _open_image(self, image_bytes: bytes) -> Image.Image:
        try:
            return Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as exc:
            raise ValueError(f"Cannot decode input image: {exc}") from exc

    def _foreground_coverage(self, mask: Image.Image) -> float:
        total = mask.width * mask.height
        if total == 0:
            return 0.0
        hist = mask.histogram()
        foreground = sum(hist[129:256])
        return foreground / total

    def _fallback_segment(self, pil_image: Image.Image) -> SegmentationResult:
        gray = pil_image.convert("L")

        corner_colors = [
            gray.getpixel((0, 0)),
            gray.getpixel((gray.width - 1, 0)),
            gray.getpixel((0, gray.height - 1)),
            gray.getpixel((gray.width - 1, gray.height - 1)),
        ]
        bg_color = sum(corner_colors) // len(corner_colors)

        bg_img = Image.new("L", gray.size, bg_color)
        diff = ImageChops.difference(gray, bg_img)
        mask = diff.point(lambda p: 255 if p > 20 else 0).convert("L")

        coverage = self._foreground_coverage(mask)
        if coverage < 0.02 or coverage > 0.98:
            logger.warning(
                "Threshold fallback also degenerate (coverage=%.3f). Passing through original image.",
                coverage,
            )
            rgba = pil_image.convert("RGBA")
            white_mask = Image.new("L", pil_image.size, 255)
            return SegmentationResult(
                segmented_bytes=self._encode_png(rgba),
                mask_bytes=self._encode_png(white_mask),
                model_name="original-passthrough",
            )

        segmented = pil_image.copy().convert("RGBA")
        segmented.putalpha(mask)

        return SegmentationResult(
            segmented_bytes=self._encode_png(segmented),
            mask_bytes=self._encode_png(mask),
            model_name="PIL-Threshold-Fallback",
        )

    def _encode_png(self, image: Image.Image) -> bytes:
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()

    def _lazy_load(self) -> None:
        if self._session is not None:
            return
        from rembg import new_session

        self._session = new_session("u2net")

    def warmup(self) -> None:
        try:
            self._lazy_load()
        except Exception as exc:
            logger.warning("RembgSegmenter warmup failed (%s); fallback will be used", exc)
