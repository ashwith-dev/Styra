"""Shared httpx.AsyncClient with connection pooling.

Reuses a single client instance across the application lifespan so
outbound HTTP calls (OpenRouter, JWKS fetching) share a connection
pool instead of creating a new client per request.
"""

import httpx

_pooled: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    """Return the application-wide ``httpx.AsyncClient`` singleton.

    The client is created lazily on first call with sensible defaults:
    connection pooling, keep-alive, and a generous pool size for
    concurrent outbound requests.
    """
    global _pooled
    if _pooled is None:
        _pooled = httpx.AsyncClient(
            limits=httpx.Limits(
                max_keepalive_connections=20,
                max_connections=50,
                keepalive_expiry=30.0,
            ),
            timeout=httpx.Timeout(30.0),
        )
    return _pooled


async def close_http_client() -> None:
    """Gracefully close the shared client (call at shutdown)."""
    global _pooled
    if _pooled is not None:
        await _pooled.aclose()
        _pooled = None
