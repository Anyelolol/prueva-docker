from fastapi import APIRouter
from models.schemas import AnalyzeRequest
from services.detector import detect_ai, load_detector, is_detector_loaded

router = APIRouter()

@router.post("/detect")
def detect(req: AnalyzeRequest):
    return detect_ai(req.text)

@router.get("/detect/health")
def detect_health():
    return {"model_loaded": is_detector_loaded()}