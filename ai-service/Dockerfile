FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (default 8000 or GCP Cloud Run $PORT)
ENV PORT=8000
EXPOSE 8000

# Run FastAPI app with Uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
