from fastapi import APIRouter
from models.schemas import AnalyzeRequest, AnalyzeResponse, SegmentResult
from services.similarity import (
    compute_similarity,
    compute_segments,
    es_plagio,
    load_model,
    is_model_loaded,
    get_model_name,
)

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    reference = req.reference or ""

    similarity = compute_similarity(req.text, reference)
    is_plagiarism = es_plagio(req.text, reference)

    segments_raw = compute_segments(req.text, reference) if reference else []
    segments = [SegmentResult(**s) for s in segments_raw]

    return AnalyzeResponse(
        similarity=round(similarity, 4),
        is_plagiarism=is_plagiarism,
        segments=segments,
    )
