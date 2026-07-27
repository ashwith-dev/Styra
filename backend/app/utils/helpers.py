import logging

logger = logging.getLogger(__name__)


def format_timestamp(dt_str: str | None) -> str:
    """Return a consistent ISO-format timestamp string."""
    if dt_str is None:
        return ""
    return dt_str.replace("T", " ").split("+")[0].split(".")[0]
