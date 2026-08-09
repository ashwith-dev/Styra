import asyncio

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status

from app.models.api_contract import AnalyzeClothingResponse
from app.services.pipeline_service import PipelineService
from app.services.pipeline_store import (
    persist_pipeline_result,
    stage_pipeline_result,
)
from app.dependencies import get_current_user

router = APIRouter()

# Strong references to in-flight DB-backup tasks so they can't be
# garbage-collected mid-run (fire-and-forget, but never silently lost).
_PERSIST_TASKS: set[asyncio.Task] = set()


def _get_pipeline_service() -> PipelineService:
    """Lazy singleton — wired in ``main.py``."""
    from app.main import pipeline_service

    return pipeline_service


@router.post("/analyze-clothing", response_model=AnalyzeClothingResponse)
async def analyze_clothing(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    pipeline: PipelineService = Depends(_get_pipeline_service),
) -> AnalyzeClothingResponse:
    """Run the full AI pipeline on an uploaded photo and return structured
    metadata **without saving anything to the database**.

    The caller should present the result to the user for editing, then call
    ``POST /clothing`` with the ``pipeline_token`` to persist.
    """
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI pipeline is not available (missing configuration or startup failed)",
        )

    image_bytes = await file.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds 10 MB limit",
        )

    result = await pipeline.run(image_bytes)

    if result.status == "failed":
        # Failed results are never staged — nothing useful to save later,
        # and staging them would leak server-side resources.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Pipeline processing failed",
                "stage_failed": result.stage_failed,
                "error": result.error_message,
                "metrics": [m.model_dump() for m in result.metrics],
            },
        )

    # Stage in memory synchronously so a save request that arrives right
    # after this response can always claim its token; the DB backup write
    # is best-effort and runs in the background.
    stage_pipeline_result(result, user_id)
    persist_task = asyncio.create_task(
        asyncio.to_thread(persist_pipeline_result, result, user_id)
    )
    _PERSIST_TASKS.add(persist_task)
    persist_task.add_done_callback(_PERSIST_TASKS.discard)

    return AnalyzeClothingResponse(
        pipeline_token=result.pipeline_token,
        result=result.attributes,
        segmented_image_url=result.segmented_image_url,
        thumbnail_url=result.thumbnail_url,
        metrics=[m.model_dump() for m in result.metrics],
    )
