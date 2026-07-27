"""Base interface for clothing attribute extraction backends.

Every extraction model (Qwen2.5-VL, future model) implements this interface.
"""

from abc import ABC, abstractmethod

from app.services.extraction.base_attributes import AIPipelineResult


class BaseAttributeExtractor(ABC):
    """Extract structured clothing attributes from a segmented garment image."""

    @abstractmethod
    def extract(self, segmented_image_bytes: bytes) -> AIPipelineResult:
        """Return structured clothing attributes."""
        ...
