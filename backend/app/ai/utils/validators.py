"""Reusable validation helpers for the AI outfit engine.

Pure functions for validating outfit requests, wardrobe data, and
engine outputs. No side effects — callable from any context.
"""

from app.ai.models.outfit_request import OutfitRequest
from app.ai.models.candidate import CandidateItem
from app.ai.models.recommendation import OutfitRecommendation
from app.ai.utils.exceptions import AIValidationError


def validate_outfit_request(request: OutfitRequest) -> None:
    """Validate an outfit generation request.

    Args:
        request: The outfit request to validate.

    Raises:
        AIValidationError: If the request fails any validation check.
    """
    if not request.user_id or not request.user_id.strip():
        raise AIValidationError("user_id is required")

    if request.max_outfits < 1 or request.max_outfits > 20:
        raise AIValidationError("max_outfits must be between 1 and 20")

    if not request.wardrobe_items:
        raise AIValidationError("wardrobe_items must not be empty")


def validate_wardrobe_items(items: list[CandidateItem]) -> None:
    """Validate a collection of wardrobe candidate items.

    Args:
        items: List of candidate items to validate.

    Raises:
        AIValidationError: If any item fails validation.
    """
    if not items:
        raise AIValidationError("wardrobe items list is empty")

    seen_ids: set[str] = set()
    for item in items:
        if not item.id or not item.id.strip():
            raise AIValidationError("each wardrobe item must have a non-empty id")
        if item.id in seen_ids:
            raise AIValidationError(f"duplicate item id: {item.id}")
        seen_ids.add(item.id)
        if not item.attributes:
            raise AIValidationError(f"item {item.id} must have attributes")
        required_attrs = {"category", "type", "color"}
        missing = required_attrs - set(item.attributes.keys())
        if missing:
            raise AIValidationError(
                f"item {item.id} missing required attributes: {', '.join(sorted(missing))}"
            )


def validate_outfit_recommendation(rec: OutfitRecommendation) -> None:
    """Validate a single outfit recommendation result.

    Args:
        rec: The outfit recommendation to validate.

    Raises:
        AIValidationError: If the recommendation fails validation.
    """
    if not rec.outfit_id:
        raise AIValidationError("outfit recommendation missing outfit_id")
    if not rec.items:
        raise AIValidationError(f"outfit {rec.outfit_id} has no items")
    if rec.score < 0 or rec.score > 100:
        raise AIValidationError(f"outfit {rec.outfit_id} score out of range: {rec.score}")


def validate_outfit_response(recommendations: list[OutfitRecommendation]) -> None:
    """Validate a complete outfit response.

    Args:
        recommendations: List of outfit recommendations to validate.

    Raises:
        AIValidationError: If any recommendation fails validation.
    """
    if not recommendations:
        raise AIValidationError("response contains no recommendations")

    seen_ids: set[str] = set()
    for rec in recommendations:
        validate_outfit_recommendation(rec)
        if rec.outfit_id in seen_ids:
            raise AIValidationError(f"duplicate outfit_id in response: {rec.outfit_id}")
        seen_ids.add(rec.outfit_id)
