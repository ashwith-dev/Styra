from fastapi import APIRouter

from app.config import settings

router = APIRouter()


@router.get("/health")
async def health():
    status = "ok"
    checks: dict[str, str] = {}

    # Supabase
    try:
        from app.services.supabase_client import get_supabase

        get_supabase().table("clothing_items").select("id", limit=1).execute()
        checks["supabase"] = "ok"
    except Exception as exc:
        checks["supabase"] = f"unavailable: {exc}"
        status = "degraded"

    # Pipeline
    try:
        from app.main import pipeline_service

        if pipeline_service is not None:
            checks["pipeline"] = "available"
        else:
            checks["pipeline"] = "not configured"
    except Exception as exc:
        checks["pipeline"] = f"error: {exc}"

    return {
        "status": status,
        "version": settings.app_version,
        "checks": checks,
    }
