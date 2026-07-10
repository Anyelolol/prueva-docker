FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

# --extra-index-url fuerza el wheel CPU-only de torch cuando existe,
# evitando bajar el build con soporte CUDA (mucho más pesado e innecesario
# en un servidor sin GPU dedicada para esto).
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

COPY src ./src

# Los modelos pesan <100MB, se commitean a git y se hornean directo
# en la imagen (no hace falta volumen para esto).
COPY models ./models

WORKDIR /app/src

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
