"""In-memory token-bucket rate limiter.

For production at scale replace this with a Redis-backed implementation.
The in-memory store is per-process and suitable for single-worker deployments.
"""

import time
import threading
from typing import Optional

from fastapi import HTTPException, Request, status

# ── Per-endpoint bucket configuration ──
# Each entry: (max_tokens, refill_seconds) — so "N requests per S seconds".
_RATE_LIMITS: dict[str, tuple[int, float]] = {
    "/analyze-clothing": (5, 60.0),    # 5 requests per minute (costly AI pipeline)
    "/clothing": (50, 60.0),           # 50 write requests per minute
    "/recommendations/feedback": (30, 60.0),
    "/recommendations/favorites": (30, 60.0),
    # Everything else falls back to DEFAULT.
}

DEFAULT_LIMIT: tuple[int, float] = (200, 60.0)  # 200 requests per minute default

_BURST_FACTOR = 1.5  # allow slight burst over the per-second fill rate


class _Bucket:
    __slots__ = ("tokens", "last_refill", "max_tokens", "refill_rate")

    def __init__(self, max_tokens: float, refill_seconds: float) -> None:
        self.max_tokens = max_tokens * _BURST_FACTOR
        self.refill_rate = max_tokens / refill_seconds
        self.tokens = self.max_tokens
        self.last_refill = time.monotonic()

    def consume(self) -> bool:
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.max_tokens, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False


_store: dict[str, _Bucket] = {}
_lock = threading.Lock()


def _key_for(request: Request) -> str:
    """Build a rate-limit key scoped to the authenticated user (or IP as fallback)."""
    user_id: Optional[str] = None
    try:
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if token:
            from jose import jwt
            from app.config import settings

            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            user_id = payload.get("sub")
    except Exception:
        pass

    client = user_id or request.client.host if request.client else "unknown"
    return f"{client}:{request.url.path}"


def get_rate_limit_config(path: str) -> tuple[int, float]:
    for prefix, limit in _RATE_LIMITS.items():
        if path.startswith(prefix):
            return limit
    return DEFAULT_LIMIT


async def rate_limit_middleware(request: Request, call_next):
    path = request.url.path
    max_tokens, refill = get_rate_limit_config(path)
    key = _key_for(request)

    with _lock:
        bucket = _store.get(key)
        if bucket is None or (bucket.max_tokens != max_tokens * _BURST_FACTOR):
            bucket = _Bucket(max_tokens, refill)
            _store[key] = bucket

        if not bucket.consume():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please slow down.",
            )

    return await call_next(request)
