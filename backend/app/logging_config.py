import logging
import sys
from contextvars import ContextVar

_correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="-")


def get_correlation_id() -> str:
    """Return the current request's correlation ID, or '-' if not set."""
    return _correlation_id_var.get()


def set_correlation_id(cid: str) -> None:
    """Set the correlation ID for the current async context."""
    _correlation_id_var.set(cid)


class _CorrelationIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.correlation_id = _correlation_id_var.get("-")
        return True


def configure_logging(level: str = "INFO") -> None:
    log_level = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format="%(levelname)-5s  [%(correlation_id)s]  %(name)s  %(message)s",
        stream=sys.stdout,
        force=True,
    )

    _filter = _CorrelationIdFilter()
    root = logging.getLogger()

    # Register filter on root logger and all handlers
    for handler in root.handlers:
        handler.addFilter(_filter)
    root.addFilter(_filter)

    # Configure uvicorn loggers so request logs also carry correlation_id
    # and print cleanly to stdout
    for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        uv_logger = logging.getLogger(logger_name)
        uv_logger.setLevel(log_level)
        uv_logger.addFilter(_filter)
        for handler in uv_logger.handlers:
            handler.addFilter(_filter)

    # Quiet noisy third-party loggers
    logging.getLogger("supabase").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("onnxruntime").setLevel(logging.ERROR)

