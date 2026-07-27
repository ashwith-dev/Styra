from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class SegmentationResult:
    segmented_bytes: bytes
    mask_bytes: bytes
    model_name: str


class BaseSegmenter(ABC):
    """Abstract garment segmenter.

    Implementations: RMBGSegmenter, SegFormerSegmenter, SCHPSegmenter, etc.
    """

    @abstractmethod
    def segment(self, image_bytes: bytes) -> SegmentationResult:
        """Return a segmentation with the garment isolated on a transparent background."""
        ...

    def warmup(self) -> None:
        """Optional: preload model weights at startup. Default no-op."""
        return None
