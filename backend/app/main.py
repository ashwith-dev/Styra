from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.logging_config import configure_logging
from app.errors import (
    AppError,
    app_error_handler,
    http_exception_handler,
    pydantic_validation_handler,
    generic_exception_handler,
)
from app.services.pipeline_service import PipelineService
from app.services.validation.image_validator import ImageValidator
from app.services.segmentation.rembg_segmenter import RembgSegmenter
from app.services.extraction.qwen_extractor import QwenExtractor
from app.services.storage_service import StorageService

import logging

logger = logging.getLogger(__name__)

# ── Pipeline service singleton (wired at startup, used by analyze route) ──
pipeline_service: PipelineService | None = None


def _build_pipeline() -> PipelineService | None:
    try:
        return PipelineService(
            validator=ImageValidator(),
            segmenter=RembgSegmenter(),
            extractor=QwenExtractor(),
            storage=StorageService(),
        )
    except Exception as exc:
        logger.warning("Pipeline not available at startup: %s", exc)
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline_service
    configure_logging(settings.log_level)
    logger.info("Starting Clothing App API v%s", settings.app_version)
    pipeline_service = _build_pipeline()
    if pipeline_service is not None:
        await pipeline_service.warmup()
    yield
    pipeline_service = None
    logger.info("Shutting down")


app = FastAPI(
    title="Clothing App API",
    version=settings.app_version,
    lifespan=lifespan,
)

# ── Middleware ──
cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials="*" not in cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ──
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(ValidationError, pydantic_validation_handler)
app.exception_handler(500)(generic_exception_handler)

# ── Routes ──
from app.api.health import router as health_router  # noqa: E402
from app.api.clothing import router as clothing_router  # noqa: E402
from app.api.analyze import router as analyze_router  # noqa: E402
from app.api.recommendations import router as recs_router  # noqa: E402

app.include_router(health_router, tags=["Health"])
app.include_router(clothing_router, tags=["Clothing"])
app.include_router(analyze_router, tags=["Pipeline"])
app.include_router(recs_router, tags=["Recommendations"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port)
