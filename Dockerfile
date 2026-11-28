# Multi-stage Dockerfile: Frontend Builder + Python Backend Runtime
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    flac \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV HOST=0.0.0.0
ENV PORT=10000
ENV PYTHONPATH=/app/backend

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
