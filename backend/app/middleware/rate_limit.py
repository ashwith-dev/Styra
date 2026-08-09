"""In-memory token-bucket rate limiter.

For production at scale replace this with a Redis-backed implementation.
The in-memory store is per-process and suitable for single-worker deployments.
"""

import time
import threading
from typing import Optional

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.config import settings

# ── Per-endpoint bucket configuration ──
# Each entry: (max_tokens, refill_seconds) — so "N requests per S seconds".
# Keys are API-prefix-relative (i.e. without the "/v1" prefix).
_RATE_LIMITS: dict[str, tuple[int, float]] = {
    "/analyze-clothing": (5, 60.0),    # 5 requests per minute (costly AI pipeline)
    "/clothing": (50, 60.0),           # 50 write requests per minute
    "/recommendations/feedback": (30, 60.0),
    "/recommendations/favorites": (30, 60.0),
    "/outfits/generate": (30, 60.0),   # calls a paid LLM — tighter than default
    "/outfits/regenerate": (30, 60.0),
    # Everything else falls back to DEFAULT.
}

DEFAULT_LIMIT: tuple[int, float] = (200, 60.0)  # 200 requests per minute default

_BURST_FACTOR = 1.5  # allow slight burst over the per-second fill rate

# Cap the bucket store so a flood of distinct users/IPs cannot grow memory
# without bound. When exceeded, stale buckets (idle > 10 min) are evicted.
_MAX_STORE_ENTRIES = 10_000
_STALE_AFTER_SECONDS = 600.0


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
    """Build a rate-limit key scoped to the authenticated user (or IP as fallback).

    Bucketing needs identity only, not a freshness guarantee. Verified
    decoding is used when the JWKS cache is warm (no network); otherwise we
    fall back to unverified claims rather than doing a blocking JWKS fetch
    on the event loop. Real verification still happens in the auth
    dependency for every protected route.
    """
    user_id: Optional[str] = None
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    if token:
        try:
            from app.utils.jwt import decode_access_token, has_cached_signing_keys

            if has_cached_signing_keys():
                user_id = decode_access_token(token).get("sub")
            else:
                from jose import jwt as jose_jwt

                user_id = jose_jwt.get_unverified_claims(token).get("sub")
        except Exception:
            user_id = None

    client = user_id or (request.client.host if request.client else "unknown")
    return f"{client}:{request.url.path}"


def _route_path(path: str) -> str:
    """Strip the configured API prefix so limit keys match versioned paths."""
    prefix = settings.api_prefix
    if prefix and path.startswith(prefix):
        return path[len(prefix):]
    return path


def get_rate_limit_config(path: str) -> tuple[int, float]:
    route = _route_path(path)
    for prefix, limit in _RATE_LIMITS.items():
        if route.startswith(prefix):
            return limit
    return DEFAULT_LIMIT


def _evict_stale(now: float) -> None:
    """Drop buckets idle longer than the staleness window.

    Stale buckets are evicted first. If none are stale, the *oldest*
    active bucket is evicted to prevent unbounded memory growth. This
    is a simple LRU-like eviction: the bucket least recently refilled
    goes first.
    """
    stale = [k for k, b in _store.items() if now - b.last_refill > _STALE_AFTER_SECONDS]
    if stale:
        for k in stale:
            del _store[k]
    else:
        oldest_key = min(_store, key=lambda k: _store[k].last_refill)
        del _store[oldest_key]


async def rate_limit_middleware(request: Request, call_next):
    path = request.url.path
    max_tokens, refill = get_rate_limit_config(path)
    key = _key_for(request)

    with _lock:
        if len(_store) >= _MAX_STORE_ENTRIES:
            _evict_stale(time.monotonic())

        bucket = _store.get(key)
        if bucket is None or (bucket.max_tokens != max_tokens * _BURST_FACTOR):
            bucket = _Bucket(max_tokens, refill)
            _store[key] = bucket

        allowed = bucket.consume()

    if not allowed:
        # Return a response directly: raising HTTPException here would bypass
        # the app's exception handlers (they sit inside the middleware stack)
        # and surface to clients as a 500.
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please slow down."},
            headers={"Retry-After": str(int(refill))},
        )

    return await call_next(request)
