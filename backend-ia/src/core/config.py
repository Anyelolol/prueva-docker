import os
from pathlib import Path
from dotenv import load_dotenv

_BASE = Path(__file__).resolve().parent.parent.parent
load_dotenv(_BASE / ".env")


def _resolve_path(env_value: str) -> str:
    """Convierte rutas relativas (./models/...) en absolutas basadas en _BASE."""
    p = Path(env_value)
    if not p.is_absolute():
        p = (_BASE / p).resolve()
    return str(p)


SIMILARITY_MODEL_PATH = _resolve_path(
    os.getenv("SIMILARITY_MODEL_PATH", "models/similarity_model/detector_plagio.joblib")
)
# Los umbrales de decisión (coseno y jaccard, evaluados con OR) se leen
# directo en services/similarity.py vía SIMILARITY_COS_THRESHOLD /
# SIMILARITY_JAC_THRESHOLD, con defaults calibrados (0.45 / 0.17).
DETECTOR_MODEL_PATH = _resolve_path(
    os.getenv("DETECTOR_MODEL_PATH", "models/modelo_detector_es_final")
)
