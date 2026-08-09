import io
import logging
import uuid
from dataclasses import dataclass

from PIL import Image

from app.config import settings
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

# URLs are refreshed on every API read so they never expire in the client.
# 7 days gives ample time between app opens without requiring a refresh on
# every single wardrobe fetch.
_SIGNED_URL_EXPIRY_SECONDS = 604_800  # 7 days


@dataclass
class StoredImage:
    path: str
    public_url: str


class StorageService:
    """Upload/download images from Supabase Storage.

    Buckets are created as *private* so clothing photos are never
    publicly accessible by URL. All image access goes through signed
    URLs that expire.
    """

    def __init__(self) -> None:
        self._client = get_supabase()
        self._ensure_buckets()

    def _ensure_buckets(self) -> None:
        """Auto-create any missing image buckets as private.

        Uses the service-role key (can manage storage) so this runs at
        startup. If a bucket listed here already exists as *public* in
        Supabase, the dashboard should be used to flip it to private.
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
                        bucket, options={"public": False}
                    )
                    logger.info("Created private storage bucket %r", bucket)
        except Exception:
            logger.warning(
                "Could not verify/create Supabase storage buckets", exc_info=True
            )

    def _signed_url(self, bucket: str, key: str) -> str:
        """Return a signed download URL valid for the configured window."""
        try:
            resp = self._client.storage.from_(bucket).create_signed_url(
                key, _SIGNED_URL_EXPIRY_SECONDS
            )
            return resp.get("signedURL", "")
        except Exception:
            logger.warning(
                "Failed to create signed URL for %s/%s; falling back to public",
                bucket, key, exc_info=True,
            )
            return self._client.storage.from_(bucket).get_public_url(key)

    def upload_original(self, image_bytes: bytes) -> StoredImage:
        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_originals
        self._client.storage.from_(bucket).upload(
            key, image_bytes, {"content-type": "image/png"}
        )
        url = self._signed_url(bucket, key)
        return StoredImage(path=f"{bucket}/{key}", public_url=url)

    def upload_segmented(self, image_bytes: bytes) -> StoredImage:
        key = f"{uuid.uuid4().hex}.png"
        bucket = settings.storage_bucket_segmented
        self._client.storage.from_(bucket).upload(
            key, image_bytes, {"content-type": "image/png"}
        )
        url = self._signed_url(bucket, key)
        return StoredImage(path=f"{bucket}/{key}", public_url=url)

    def delete(self, path: str) -> None:
        """Delete a previously uploaded object by its ``bucket/key`` path."""
        try:
            if "/" in path:
                bucket, key = path.split("/", 1)
                self._client.storage.from_(bucket).remove([key])
        except Exception as exc:
            logger.warning("Failed to delete image %s: %s", path, exc)

    def delete_by_public_url(self, url: str | None) -> None:
        """Delete an object given its public or signed URL.

        Parses the bucket and key from a Supabase storage URL
        (``…/storage/v1/object/{public|sign}/{bucket}/{key}``).
        Anything else is ignored. Failures are logged and swallowed.
        """
        if not url:
            return
        markers = [
            "/storage/v1/object/public/",
            "/storage/v1/object/sign/",
            "/storage/v1/object/authenticated/",
        ]
        for marker in markers:
            if marker in url:
                bucket_key = url.split(marker, 1)[1].split("?", 1)[0]
                bucket, _, key = bucket_key.partition("/")
                if not bucket or not key:
                    return
                try:
                    self._client.storage.from_(bucket).remove([key])
                except Exception as exc:
                    logger.warning("Failed to delete image %s/%s: %s", bucket, key, exc)
                return

    def get_signed_url(self, path: str, expires_in: int = _SIGNED_URL_EXPIRY_SECONDS) -> str:
        """Return a fresh signed URL for an existing object."""
        if "/" in path:
            bucket, key = path.split("/", 1)
            try:
                resp = self._client.storage.from_(bucket).create_signed_url(key, expires_in)
                return resp.get("signedURL", "")
            except Exception:
                logger.warning("Failed to create signed URL for %s", path, exc_info=True)
                return self._client.storage.from_(bucket).get_public_url(key)
        return ""

    _URL_COLS = ("image_url", "original_image_url", "thumbnail_url")
    _URL_MARKERS = (
        "/storage/v1/object/sign/",
        "/storage/v1/object/public/",
        "/storage/v1/object/authenticated/",
    )

    @staticmethod
    def _parse_storage_url(stored_url: str) -> tuple[str | None, str | None]:
        """Extract ``(bucket, key)`` from any stored Supabase storage URL."""
        for marker in StorageService._URL_MARKERS:
            if marker in stored_url:
                bucket_key = stored_url.split(marker, 1)[1].split("?", 1)[0]
                bucket, _, key = bucket_key.partition("/")
                if bucket and key:
                    return bucket, key
        return None, None

    def refresh_urls_for_row(self, row: dict) -> dict:
        """Return a copy of *row* with fresh signed URLs for all image fields.

        Supabase signed URLs embed the bucket and key in the URL path so we
        can always regenerate a fresh URL from the stored one — even after
        the old signed token has expired. Falls back silently to the stored
        URL if parsing or the Supabase call fails (better a broken image
        than a server error).

        Supported URL shapes:
          .../storage/v1/object/sign/{bucket}/{key}?token=...
          .../storage/v1/object/public/{bucket}/{key}
          .../storage/v1/object/authenticated/{bucket}/{key}
        """
        refreshed = dict(row)

        for col in self._URL_COLS:
            stored_url = row.get(col)
            if not stored_url:
                continue

            bucket, key = self._parse_storage_url(stored_url)
            if bucket and key:
                fresh = self.get_signed_url(f"{bucket}/{key}")
                if fresh:
                    refreshed[col] = fresh

        return refreshed

    def refresh_urls_for_rows(self, rows: list[dict]) -> list[dict]:
        """Batch variant of :meth:`refresh_urls_for_row`.

        Groups every image key by bucket and issues one
        ``create_signed_urls`` call per bucket, instead of one HTTP call
        per image column per row (a 100-item wardrobe would otherwise cost
        200–300 sequential storage round trips per request).
        """
        refreshed = [dict(r) for r in rows]

        # bucket → key → [(row_index, column), ...]  (dedupes shared keys)
        by_bucket: dict[str, dict[str, list[tuple[int, str]]]] = {}
        for idx, row in enumerate(rows):
            for col in self._URL_COLS:
                stored_url = row.get(col)
                if not stored_url:
                    continue
                bucket, key = self._parse_storage_url(stored_url)
                if bucket and key:
                    by_bucket.setdefault(bucket, {}).setdefault(key, []).append((idx, col))

        for bucket, keys in by_bucket.items():
            try:
                results = self._client.storage.from_(bucket).create_signed_urls(
                    list(keys), _SIGNED_URL_EXPIRY_SECONDS
                )
                url_by_key = {
                    item["path"]: item["signedURL"]
                    for item in results
                    if not item.get("error") and item.get("signedURL")
                }
            except Exception:
                logger.warning(
                    "Batch signed URL creation failed for bucket %s; "
                    "falling back to per-key signing",
                    bucket, exc_info=True,
                )
                url_by_key = {}
                for key in keys:
                    fresh = self.get_signed_url(f"{bucket}/{key}")
                    if fresh:
                        url_by_key[key] = fresh

            for key, targets in keys.items():
                fresh = url_by_key.get(key)
                if not fresh:
                    continue
                for idx, col in targets:
                    refreshed[idx][col] = fresh

        return refreshed


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
        url = self._signed_url(bucket, key)
        return StoredImage(path=f"{bucket}/{key}", public_url=url)


_service: StorageService | None = None


def get_storage_service() -> StorageService:
    """Shared StorageService singleton (avoids re-listing buckets per call)."""
    global _service
    if _service is None:
        _service = StorageService()
    return _service
