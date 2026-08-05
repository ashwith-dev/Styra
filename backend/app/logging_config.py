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
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(levelname)-5s  [%(correlation_id)s]  %(name)s  %(message)s",
        stream=sys.stdout,
        force=True,
    )

    _filter = _CorrelationIdFilter()
    root = logging.getLogger()

    # Register filter on handlers, not the root logger, so the filter
    # always runs before the handler's formatter expands %(correlation_id)s.
    for handler in root.handlers:
        handler.addFilter(_filter)

    # Also register on the root logger as a belt-and-suspenders for any
    # loggers that add their own handler after this point.
    root.addFilter(_filter)

    # Quiet noisy third-party loggers
    logging.getLogger("supabase").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
