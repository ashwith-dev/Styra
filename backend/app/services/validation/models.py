from dataclasses import dataclass, field


@dataclass
class ValidationResult:
    """Outcome of running an image through all validation checks.

    Attributes:
        passed: True when every check succeeded.
        reasons: Human-readable failure messages (empty when passed).
        format: Detected image format (PIL identifier) or None.
        width: Image width in pixels or None.
        height: Image height in pixels or None.
    """

    passed: bool
    reasons: list[str] = field(default_factory=list)
    format: str | None = None
    width: int | None = None
    height: int | None = None
