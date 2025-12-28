FROM python:3.11-slim

# Install system dependencies for OpenCV and EasyOCR
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download EasyOCR models during build to avoid runtime delays
RUN python -c "import easyocr; reader = easyocr.Reader(['en'], gpu=False)"

# Copy the rest of the application
COPY backend/ .

# Expose the port FastAPI runs on
EXPOSE 8000

# Command to run the application using the PORT environment variable provided by Render
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
