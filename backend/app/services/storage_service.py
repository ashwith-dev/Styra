import io
import logging
import uuid
from dataclasses import dataclass

from PIL import Image

from app.config import settings
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


@dataclass
class StoredImage:
    path: str
    public_url: str


class StorageService:
    """Upload/download images from Supabase Storage."""

    def __init__(self) -> None:
        self._client = get_supabase()
        self._ensure_buckets()

    def _ensure_buckets(self) -> None:
        """Auto-create any missing image buckets as public.

        Without the buckets every upload silently degrades to a multi-MB
        data-URI that the mobile app cannot render — so this runs at
        startup and stays best-effort (service role can manage storage).
        """
        try:
            existing = {b.name for b in self._client.storage.list_buckets()}
            for bucket in (
                settings.storage_bucket_originals,
                settings.storage_bucket_segmented,
                settings.storage_bucket_thumbnails,
            ):
                if bucket not in existing:
                    self._client.storage.create_bucket(
                        bucket, options={"public": True}
                    )
                    logger.info("Created missing public storage bucket %r", bucket)
        except Exception:
            logger.warning(
                "Could not verify/create Supabase storage buckets", exc_info=True
            )

    def upload_original(self, image_bytes: bytes) -> StoredImage:
        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_originals
        self._client.storage.from_(bucket).upload(
            key, image_bytes, {"content-type": "image/png"}
        )
        url = self._client.storage.from_(bucket).get_public_url(key)
        return StoredImage(path=f"{bucket}/{key}", public_url=url)

    def upload_segmented(self, image_bytes: bytes) -> StoredImage:
        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_segmented
        self._client.storage.from_(bucket).upload(
            key, image_bytes, {"content-type": "image/png"}
        )
        url = self._client.storage.from_(bucket).get_public_url(key)
        return StoredImage(path=f"{bucket}/{key}", public_url=url)

    def delete(self, path: str) -> None:
        """Delete a previously uploaded object by its ``bucket/key`` path."""
        try:
            if "/" in path:
                bucket, key = path.split("/", 1)
                self._client.storage.from_(bucket).remove([key])
        except Exception as exc:
            logger.warning("Failed to delete image %s: %s", path, exc)

    def upload_thumbnail(self, image_bytes: bytes) -> StoredImage:
        img = Image.open(io.BytesIO(image_bytes))
        min_side = min(img.width, img.height)
        left = (img.width - min_side) // 2
        top = (img.height - min_side) // 2
        cropped = img.crop((left, top, left + min_side, top + min_side))
        resized = cropped.resize((300, 300), Image.LANCZOS)

        buf = io.BytesIO()
        resized.save(buf, format="PNG")
        thumb_bytes = buf.getvalue()

        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_thumbnails
        self._client.storage.from_(bucket).upload(
            key, thumb_bytes, {"content-type": "image/png"}
        )
        url = self._client.storage.from_(bucket).get_public_url(key)
        return StoredImage(path=f"{bucket}/{key}", public_url=url)
