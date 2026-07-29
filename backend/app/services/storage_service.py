import base64
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
    """Upload/download images from Supabase Storage with data-URI fallback."""

    def __init__(self) -> None:
        try:
            self._client = get_supabase()
        except Exception:
            self._client = None

    def upload_original(self, image_bytes: bytes) -> StoredImage:
        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_originals
        try:
            if self._client:
                self._client.storage.from_(bucket).upload(
                    key, image_bytes, {"content-type": "image/png"}
                )
                url = self._client.storage.from_(bucket).get_public_url(key)
                return StoredImage(path=f"{bucket}/{key}", public_url=url)
        except Exception as exc:
            logger.warning("Supabase storage upload_original failed (%s); using data-URI fallback", exc)

        b64 = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64}"
        return StoredImage(path=f"local/{key}", public_url=data_url)

    def upload_segmented(self, image_bytes: bytes) -> StoredImage:
        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_segmented
        try:
            if self._client:
                self._client.storage.from_(bucket).upload(
                    key, image_bytes, {"content-type": "image/png"}
                )
                url = self._client.storage.from_(bucket).get_public_url(key)
                return StoredImage(path=f"{bucket}/{key}", public_url=url)
        except Exception as exc:
            logger.warning("Supabase storage upload_segmented failed (%s); using data-URI fallback", exc)

        b64 = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64}"
        return StoredImage(path=f"local/{key}", public_url=data_url)

    def delete(self, path: str) -> None:
        """Delete a previously uploaded object by its ``bucket/key`` path."""
        try:
            if self._client and "/" in path and not path.startswith("local/"):
                bucket, key = path.split("/", 1)
                self._client.storage.from_(bucket).remove([key])
        except Exception as exc:
            logger.warning("Failed to delete image %s: %s", path, exc)

    def upload_thumbnail(self, image_bytes: bytes) -> StoredImage:
        # Generate a 300×300 centre-crop thumbnail
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
        try:
            if self._client:
                self._client.storage.from_(bucket).upload(
                    key, thumb_bytes, {"content-type": "image/png"}
                )
                url = self._client.storage.from_(bucket).get_public_url(key)
                return StoredImage(path=f"{bucket}/{key}", public_url=url)
        except Exception as exc:
            logger.warning("Supabase storage upload_thumbnail failed (%s); using data-URI fallback", exc)

        b64 = base64.b64encode(thumb_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64}"
        return StoredImage(path=f"local/{key}", public_url=data_url)
