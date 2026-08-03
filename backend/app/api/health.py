import logging

from fastapi import APIRouter

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
    status = "ok"
    checks: dict[str, str] = {}

    # Supabase — exception details are logged server-side only; the public
    # response must not leak connection strings or internal errors.
    try:
        from app.services.supabase_client import get_supabase

        get_supabase().table("clothing_items").select("id").limit(1).execute()
        checks["supabase"] = "ok"
    except Exception:
        logger.warning("Health check: Supabase unavailable", exc_info=True)
        checks["supabase"] = "unavailable"
        status = "degraded"

    # Pipeline
    try:
        from app.main import pipeline_service

        if pipeline_service is not None:
            checks["pipeline"] = "available"
        else:
            checks["pipeline"] = "not configured"
    except Exception:
        logger.warning("Health check: pipeline check failed", exc_info=True)
        checks["pipeline"] = "error"

    return {
        "status": status,
        "version": settings.app_version,
        "checks": checks,
    }
