# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
DEFAULT_PAGE_SIZE = 50

# ---------------------------------------------------------------------------
# Image validation thresholds
# ---------------------------------------------------------------------------
MIN_RESOLUTION = 500       # minimum pixels per side
LAPLACIAN_THRESHOLD = 30.0  # lower = blurrier
MIN_BRIGHTNESS = 20         # 0–255 gray scale
MAX_BRIGHTNESS = 240
MIN_ASPECT_RATIO = 0.25
MAX_ASPECT_RATIO = 4.0
# Decompression-bomb guard: 10 MB of compressed PNG/JPEG can decode to a
# multi-hundred-megabyte bitmap. Reject before any pixel data is expanded.
MAX_PIXELS = 50_000_000  # 50 MP

# ---------------------------------------------------------------------------
# Thumbnail generation
# ---------------------------------------------------------------------------
THUMBNAIL_SIZE = 300

# ---------------------------------------------------------------------------
# Allowed image formats (PIL format identifiers)
# ---------------------------------------------------------------------------
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}

# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------
STORAGE_BUCKET_ORIGINALS = "clothing-originals"
STORAGE_BUCKET_SEGMENTED = "clothing-segmented"
STORAGE_BUCKET_THUMBNAILS = "clothing-thumbnails"
