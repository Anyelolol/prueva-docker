import os
import re
import unicodedata
import joblib
import numpy as np
from scipy.sparse import hstack
from sklearn.metrics.pairwise import cosine_similarity

from core.config import SIMILARITY_MODEL_PATH

# Reemplaza el modelo semántico (sentence-transformers) por un detector
# TF-IDF (char + word n-gramas) + SVD, con dos señales complementarias:
#
#   - coseno (TF-IDF+SVD): captura parafraseo real (sinónimos, reescritura),
#     porque comparte n-gramas de caracteres de los términos clave aunque
#     cambien las palabras funcionales.
#   - jaccard (trigramas de palabras): captura copy-paste / plagio literal
#     con retoques menores.
#
# El "alpha" que trae el .joblib entrenado promedia ambas señales, pero eso
# HACE QUE EL JACCARD (que da ~0 en parafraseo real) arrastre para abajo al
# coseno (que sí detecta parafraseo, ~0.55-0.60) y el score combinado nunca
# cruza el umbral. Por eso acá NO se usa el alpha entrenado: se evalúan las
# dos señales por separado con un OR, cada una con su propio umbral.
#
# Calibrado empíricamente (ver conversación/pruebas):
#   COS_THRESHOLD  = 0.45  -> separa "no relacionado" (~0.18-0.20) de
#                             "parafraseo real" (~0.55-0.60) con margen amplio.
#   JAC_THRESHOLD  = 0.17  -> umbral F1-óptimo para jaccard solo (viene del
#                             entrenamiento con alpha=0, F1=0.853).
COS_THRESHOLD = float(os.getenv("SIMILARITY_COS_THRESHOLD", "0.45"))
JAC_THRESHOLD = float(os.getenv("SIMILARITY_JAC_THRESHOLD", "0.17"))

_modelo: dict | None = None


def load_model() -> dict:
    global _modelo
    if _modelo is not None:
        return _modelo

    print(f"[b-ia] Cargando detector de plagio (TF-IDF+SVD): {SIMILARITY_MODEL_PATH}")
    _modelo = joblib.load(SIMILARITY_MODEL_PATH)
    print(
        f"[b-ia] Detector de plagio listo "
        f"(cos_threshold={COS_THRESHOLD}, jac_threshold={JAC_THRESHOLD})"
    )
    return _modelo


def is_model_loaded() -> bool:
    return _modelo is not None


def get_model_name() -> str:
    return str(SIMILARITY_MODEL_PATH)


def get_threshold() -> float:
    """Umbral 'informativo' para mostrar en /health. La decisión real de
    plagio usa la regla OR de dos umbrales (ver es_plagio()), no un único
    número, así que este valor es solo el más bajo de los dos como referencia."""
    return min(COS_THRESHOLD, JAC_THRESHOLD)


def _normalizar(texto: str) -> str:
    texto = texto.strip().lower()
    texto = unicodedata.normalize("NFKC", texto)
    texto = re.sub(r"\s+", " ", texto)
    return texto


def _jaccard(t1: str, t2: str, n: int = 3) -> float:
    def ngramas(texto: str, n: int):
        palabras = texto.split()
        if len(palabras) < n:
            return {texto}
        return {" ".join(palabras[i : i + n]) for i in range(len(palabras) - n + 1)}

    a, b = ngramas(t1, n), ngramas(t2, n)
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


def _vectorizar(textos: list[str], modelo: dict) -> np.ndarray:
    X_char = modelo["tfidf_char"].transform(textos)
    X_word = modelo["tfidf_word"].transform(textos)
    X = hstack([X_char, X_word]).tocsr()
    return modelo["svd"].transform(X)


def _señales(text1: str, text2: str) -> tuple[float, float]:
    """Devuelve (coseno, jaccard) crudos, sin combinar."""
    if not text1.strip() or not text2.strip():
        return 0.0, 0.0
    modelo = load_model()
    t1, t2 = _normalizar(text1), _normalizar(text2)
    emb = _vectorizar([t1, t2], modelo)
    coseno = float(cosine_similarity(emb[0:1], emb[1:2])[0, 0])
    jaccard = _jaccard(t1, t2)
    return coseno, jaccard


def es_plagio(text1: str, text2: str) -> bool:
    coseno, jaccard = _señales(text1, text2)
    return coseno >= COS_THRESHOLD or jaccard >= JAC_THRESHOLD


def compute_similarity(text1: str, text2: str) -> float:
    """Score único para mostrar/guardar (no es el que decide plagio directamente,
    ver es_plagio()). Se reporta el máximo de las dos señales."""
    coseno, jaccard = _señales(text1, text2)
    return max(coseno, jaccard)


def compute_segments(text: str, reference: str, window: int = 200, step: int = 100) -> list[dict]:
    if not text.strip() or not reference.strip():
        return []

    words = text.split()
    result = []

    for i in range(0, max(1, len(words) - window + 1), step):
        chunk = " ".join(words[i : i + window])
        inicio = len(" ".join(words[:i]))
        fin = inicio + len(chunk)
        coseno, jaccard = _señales(chunk, reference)

        if coseno >= COS_THRESHOLD or jaccard >= JAC_THRESHOLD:
            result.append({
                "inicio_documento": inicio,
                "fin_documento": fin,
                "texto_documento": chunk,
                "texto_coincidente": reference[:300],
                "porcentaje_similitud": round(max(coseno, jaccard), 4),
            })

    return result
