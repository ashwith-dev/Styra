import uuid

from fastapi import Request

from app.logging_config import set_correlation_id


async def correlation_id_middleware(request: Request, call_next):
    """Attach a unique correlation ID to every request for tracing.

    Sets the ID both on ``request.state`` (accessible to route handlers)
    and in a ``ContextVar`` (automatically included in every log line).
    """
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.correlation_id = request_id
    set_correlation_id(request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
