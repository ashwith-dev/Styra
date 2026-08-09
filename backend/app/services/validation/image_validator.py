import io

import cv2
import numpy as np
from PIL import Image, ImageOps

from app.constants import (
    MIN_RESOLUTION,
    LAPLACIAN_THRESHOLD,
    MIN_BRIGHTNESS,
    MAX_BRIGHTNESS,
    MIN_ASPECT_RATIO,
    MAX_ASPECT_RATIO,
    MAX_PIXELS,
    ALLOWED_IMAGE_FORMATS,
)
from app.services.validation.models import ValidationResult


class ImageValidationError(Exception):
    """Raised when an image cannot be decoded at all."""


class ImageValidator:
    """Image quality checks for clothing photos.

    Each check is a separate method so they can be tested and composed
    independently.
    """

    MIN_RESOLUTION = MIN_RESOLUTION
    LAPLACIAN_THRESHOLD = LAPLACIAN_THRESHOLD
    MIN_BRIGHTNESS = MIN_BRIGHTNESS
    MAX_BRIGHTNESS = MAX_BRIGHTNESS
    MIN_ASPECT_RATIO = MIN_ASPECT_RATIO
    MAX_ASPECT_RATIO = MAX_ASPECT_RATIO
    MAX_PIXELS = MAX_PIXELS

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def validate(self, image_bytes: bytes) -> tuple[bool, list[str]]:
        """Run all checks, returning ``(passed, reasons)``.

        This is the primary entry point.  Returns a simple tuple for
        backward compatibility with the pipeline.
        """
        result = self.validate_detailed(image_bytes)
        return result.passed, result.reasons

    def validate_detailed(self, image_bytes: bytes) -> ValidationResult:
        """Run all checks and return a structured ``ValidationResult``."""
        # 1. Decode and verify the file is a valid image
        try:
            pil_image, fmt = self._decode(image_bytes)
        except ImageValidationError as exc:
            return ValidationResult(passed=False, reasons=[str(exc)])

        width, height = pil_image.size

        reasons: list[str] = []

        # 2. Format
        fmt_reason = self._check_format(fmt)
        if fmt_reason:
            reasons.append(fmt_reason)

        # 3. Resolution
        res_reason = self._check_resolution(width, height)
        if res_reason:
            reasons.append(res_reason)

        # 4. Aspect ratio
        aspect_reason = self._check_aspect_ratio(width, height)
        if aspect_reason:
            reasons.append(aspect_reason)

        # 5. Pixel-count guard — must run before any pixel data is
        # expanded into numpy/OpenCV arrays (decompression-bomb DoS)
        pixel_reason = self._check_pixel_count(width, height)
        if pixel_reason:
            reasons.append(pixel_reason)
            return ValidationResult(
                passed=False,
                reasons=reasons,
                format=fmt,
                width=width,
                height=height,
            )

        # Convert to RGB for OpenCV
        rgb = pil_image.convert("RGB")
        cv_img = cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

        # 5. Blur
        blur_reason = self._check_blur(gray)
        if blur_reason:
            reasons.append(blur_reason)

        # 6. Brightness
        bright_reason = self._check_brightness(gray)
        if bright_reason:
            reasons.append(bright_reason)

        return ValidationResult(
            passed=len(reasons) == 0,
            reasons=reasons,
            format=fmt,
            width=width,
            height=height,
        )

    # ------------------------------------------------------------------
    # Individual check methods
    # ------------------------------------------------------------------
    def _decode(self, image_bytes: bytes) -> tuple[Image.Image, str]:
        """Open, verify EXIF orientation, and return ``(image, format)``.

        Raises ``ImageValidationError`` if the bytes don't contain a
        readable image or if the file is corrupted.
        """
        try:
            # First pass: verify the file header / integrity
            with Image.open(io.BytesIO(image_bytes)) as preview:
                preview.verify()
        except Exception as exc:
            raise ImageValidationError(
                f"File is not a valid image or is corrupted: {exc}"
            )

        # verify() can leave the file in a bad state; reopen properly
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
        except Exception as exc:
            raise ImageValidationError(
                f"Failed to open image: {exc}"
            )

        # Reject oversized images from the header alone — before any pixel
        # data is expanded into memory (decompression-bomb guard).
        width, height = pil_image.size
        if width * height > MAX_PIXELS:
            raise ImageValidationError(
                f"Image has too many pixels: {width}x{height}. "
                f"Maximum: {MAX_PIXELS // 1_000_000} MP."
            )

        try:
            # Load pixel data to catch truncated / partial files
            pil_image.load()
        except Exception as exc:
            raise ImageValidationError(
                f"Failed to load pixel data — image may be truncated: {exc}"
            )

        fmt = pil_image.format or ""
        pil_image = self._apply_exif_orientation(pil_image)
        return pil_image, fmt

    def _apply_exif_orientation(self, image: Image.Image) -> Image.Image:
        """Auto-rotate the image based on EXIF orientation metadata."""
        return ImageOps.exif_transpose(image) or image

    def _check_format(self, fmt: str) -> str | None:
        if fmt.upper() not in ALLOWED_IMAGE_FORMATS:
            return (
                f"Unsupported format '{fmt}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_FORMATS))}."
            )
        return None

    def _check_resolution(self, width: int, height: int) -> str | None:
        if width < self.MIN_RESOLUTION or height < self.MIN_RESOLUTION:
            return (
                f"Resolution too low: {width}x{height}. "
                f"Minimum {self.MIN_RESOLUTION}px per side."
            )
        return None

    def _check_aspect_ratio(self, width: int, height: int) -> str | None:
        ratio = width / height
        if ratio < self.MIN_ASPECT_RATIO or ratio > self.MAX_ASPECT_RATIO:
            return (
                f"Aspect ratio {ratio:.2f} is unusual for a clothing photo. "
                f"Expected between {self.MIN_ASPECT_RATIO} and "
                f"{self.MAX_ASPECT_RATIO}."
            )
        return None

    def _check_pixel_count(self, width: int, height: int) -> str | None:
        if width * height > self.MAX_PIXELS:
            return (
                f"Image has too many pixels: {width}x{height}. "
                f"Maximum: {self.MAX_PIXELS // 1_000_000} MP."
            )
        return None

    def _check_blur(self, gray: np.ndarray) -> str | None:
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < self.LAPLACIAN_THRESHOLD:
            return (
                f"Image is too blurry (sharpness: {laplacian_var:.1f}). "
                f"Minimum: {self.LAPLACIAN_THRESHOLD:.0f}."
            )
        return None

    def _check_brightness(self, gray: np.ndarray) -> str | None:
        mean = gray.mean()
        if mean < self.MIN_BRIGHTNESS:
            return f"Image is too dark (brightness: {mean:.0f})."
        if mean > self.MAX_BRIGHTNESS:
            return f"Image is too bright (brightness: {mean:.0f})."
        return None
