import uuid

from fastapi import Request


async def correlation_id_middleware(request: Request, call_next):
    """Attach a unique correlation ID to every request for tracing."""
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.correlation_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
