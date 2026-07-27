import asyncio

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status

from app.models.api_contract import AnalyzeClothingResponse
from app.services.pipeline_service import PipelineService
from app.services.pipeline_store import store_pipeline_result
from app.dependencies import get_current_user

router = APIRouter()


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

    await asyncio.to_thread(store_pipeline_result, result, user_id)

    return AnalyzeClothingResponse(
        pipeline_token=result.pipeline_token,
        result=result.attributes,
        segmented_image_url=result.segmented_image_url,
        thumbnail_url=result.thumbnail_url,
        metrics=[m.model_dump() for m in result.metrics],
    )
