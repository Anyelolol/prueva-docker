from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze
from routers import detect
from services.similarity import load_model, is_model_loaded, get_model_name, COS_THRESHOLD, JAC_THRESHOLD
from services.detector import load_detector

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    load_detector()
    yield


app = FastAPI(title="Plagidec B-IA", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(detect.router)

@app.get("/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": is_model_loaded(),
        "model_name":   get_model_name(),
        "cos_threshold": COS_THRESHOLD,
        "jac_threshold": JAC_THRESHOLD,
    }
