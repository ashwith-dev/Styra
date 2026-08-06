"""Gemini response validator.

Validates that Gemini's JSON output is structurally correct and that
the selected candidate ID actually exists in the provided candidate set.
Rejects hallucinated clothing, unknown IDs, and malformed responses.

Supports both numeric short IDs (1, 2, 3...) used in the simplified
prompt and full UUID outfit IDs for backward compatibility.
"""

import logging
from typing import Any, Optional

from app.ai.models.outfit_candidate import CandidateSet

logger = logging.getLogger(__name__)

_REQUIRED_FIELDS = frozenset({"selected_candidate_id", "confidence", "reason"})
_ALLOWED_FIELDS = frozenset({"selected_candidate_id", "confidence", "reason", "styling_tips"})


class GeminiResponseValidator:
    """Validate Gemini's outfit selection response."""

    def __init__(self, candidate_set: CandidateSet) -> None:
        """Initialise with the candidate set Gemini was given.

        Args:
            candidate_set: The same ``CandidateSet`` sent to Gemini.
        """
        self._candidates = candidate_set.candidates
        self._valid_ids = {
            c.outfit_id for c in self._candidates
        }
        # Build numeric-to-outfit_id mapping (1-indexed)
        self._index_map: dict[str, str] = {
            str(i): c.outfit_id
            for i, c in enumerate(self._candidates, 1)
        }

    def resolve_candidate_id(self, raw_id: Any) -> Optional[str]:
        """Resolve a numeric or UUID candidate ID to the real outfit_id.

        Accepts integral floats (``1.0`` → ``"1"``) since JSON decoders
        may parse whole numbers as floats. Returns the outfit_id if
        found, or None.
        """
        if isinstance(raw_id, bool):
            return None
        if isinstance(raw_id, float) and raw_id.is_integer():
            raw_id = int(raw_id)
        raw = str(raw_id).strip()
        # Try numeric index first
        if raw in self._index_map:
            return self._index_map[raw]
        # Try direct outfit_id match
        if raw in self._valid_ids:
            return raw
        return None

    def validate(self, response: dict[str, Any]) -> Optional[str]:
        """Validate the Gemini response.

        Returns ``None`` if the response is valid, or a string
        describing the validation failure.

        Args:
            response: Parsed JSON dict from Gemini.

        Returns:
            ``None`` for valid responses; error string for invalid ones.
        """
        if not isinstance(response, dict):
            return "Response is not a JSON object"

        # Check required fields.
        missing = _REQUIRED_FIELDS - set(response.keys())
        if missing:
            return f"Missing required fields: {', '.join(sorted(missing))}"

        # Reject extra fields.
        extra = set(response.keys()) - _ALLOWED_FIELDS
        if extra:
            return f"Unexpected fields in response: {', '.join(sorted(extra))}"

        # Validate candidate ID (numeric or UUID).
        resolved = self.resolve_candidate_id(response["selected_candidate_id"])
        if resolved is None:
            return (
                f"Unknown candidate ID '{response['selected_candidate_id']}'. "
                f"Valid numeric IDs: {', '.join(sorted(self._index_map.keys()))}"
            )

        # Validate confidence (bool is an int subclass — reject it first).
        confidence = response.get("confidence")
        if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
            return f"Confidence must be a number, got {type(confidence).__name__}"
        if not (0.0 <= float(confidence) <= 1.0):
            return f"Confidence must be between 0.0 and 1.0, got {confidence}"

        # Validate reason.
        reason = response.get("reason", "")
        if not isinstance(reason, str) or not reason.strip():
            return "Reason must be a non-empty string"

        # Validate styling_tips if present.
        tips = response.get("styling_tips")
        if tips is not None:
            if not isinstance(tips, list):
                return f"styling_tips must be a list, got {type(tips).__name__}"
            if not all(isinstance(t, str) for t in tips):
                return "All styling_tips must be strings"

        return None
