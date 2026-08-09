"""Shared pgvector formatting utilities.

Centralises the float-list ↔ pgvector-literal conversion so that
every provider and repository uses the same serialisation format.
"""

from typing import Any, Optional


def to_pgvector(embedding: list[float]) -> str:
    """Format a float list as a pgvector literal string.

    Args:
        embedding: List of float values.

    Returns:
        A pgvector-compatible string like ``[0.1,0.2,0.3]``.
    """
    return f"[{','.join(str(v) for v in embedding)}]"


def to_pgvector_or_none(embedding: Optional[list[float]]) -> Optional[str]:
    """Return a pgvector string or ``None`` if the input is ``None``.

    Args:
        embedding: Embedding vector or ``None``.

    Returns:
        Pgvector string or ``None``.
    """
    if embedding is None:
        return None
    return to_pgvector(embedding)


def from_pgvector(value: Any) -> Optional[list[float]]:
    """Parse a pgvector value into a float list.

    Handles both the Supabase text representation (``[1.0,2.0]``)
    and native Python lists.

    Args:
        value: Raw value from Supabase (string or list).

    Returns:
        Float list or ``None`` if unparseable.
    """
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip("[]")
        if not stripped:
            return None
        return [float(x) for x in stripped.split(",")]
    if isinstance(value, list):
        return [float(v) for v in value]
    return None
