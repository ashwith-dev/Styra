"""API version deprecation middleware.

Attaches ``Deprecation`` and ``Sunset`` HTTP headers to deprecated
endpoints so mobile clients know when to migrate. The deprecation map
is a simple dict: endpoint path prefix → sunset ISO timestamp.

Currently all ``/v1`` endpoints have an implicit sunset of 2027-01-01,
signalling that ``/v1`` will be supported through end of 2026. Endpoints
can be individually deprecated earlier by adding entries here.
"""

from datetime import datetime, timezone

from fastapi import Request
from fastapi.responses import Response

_DEPRECATED_ROUTES: dict[str, str] = {
    # Example: "/v1/recommendations": "2027-01-01T00:00:00Z",
}

_V1_SUNSET = "2027-01-01T00:00:00Z"


async def deprecation_header_middleware(request: Request, call_next) -> Response:
    """Add Deprecation/Sunset headers for routes scheduled for removal."""
    response: Response = await call_next(request)
    path = request.url.path

    for prefix, sunset in _DEPRECATED_ROUTES.items():
        if path.startswith(prefix):
            response.headers["Deprecation"] = "true"
            response.headers["Sunset"] = sunset
            return response

    if path.startswith("/v1"):
        response.headers["Sunset"] = _V1_SUNSET

    return response
