from pydantic import BaseModel, Field
from typing import Optional, List


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Texto del documento a evaluar")
    reference: Optional[str] = Field(None, description="Texto de referencia para comparar")


class SegmentResult(BaseModel):
    inicio_documento: int
    fin_documento: int
    texto_documento: str
    texto_coincidente: str
    porcentaje_similitud: float


class AnalyzeResponse(BaseModel):
    similarity: float = Field(..., description="Score de similitud entre 0.0 y 1.0")
    is_plagiarism: bool = Field(..., description="True si supera el umbral configurado")
    segments: List[SegmentResult] = Field(default_factory=list)
