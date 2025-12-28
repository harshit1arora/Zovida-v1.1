import easyocr
import numpy as np
from PIL import Image
import io
import os
import logging
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key for Gemini Fallback
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("✅ Gemini Vision fallback configured.")

# Global reader variable for lazy loading
reader = None

def get_reader():
    global reader
    if reader is None:
        try:
            logger.info("⏳ Initializing EasyOCR Reader...")
            reader = easyocr.Reader(['en'], gpu=False)
            logger.info("✅ EasyOCR Reader initialized.")
        except Exception as e:
            logger.error(f"❌ Failed to initialize EasyOCR Reader: {str(e)}")
            raise e
    return reader

def extract_text_with_gemini(image_bytes):
    if not GOOGLE_API_KEY:
        return None
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        content = [
            "Extract all text from this medical prescription. Only return the text found, no explanations.",
            {"mime_type": "image/jpeg", "data": image_bytes}
        ]
        response = model.generate_content(content)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini OCR Error: {str(e)}")
        return None

def extract_text(file):
    try:
        # Read file bytes
        image_bytes = file.file.read()
        
        # 1. Try EasyOCR first
        try:
            # Get reader (lazy initialization)
            current_reader = get_reader()
            
            # Convert bytes → PIL Image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Convert PIL → NumPy array
            image_np = np.array(image)
            
            # OCR
            results = current_reader.readtext(image_np)
            
            # Join detected text
            text = " ".join([res[1] for res in results])
            
            if text.strip():
                logger.info("✅ Text extracted using EasyOCR.")
                return text.strip()
        except Exception as e:
            logger.warning(f"EasyOCR failed, trying fallback: {str(e)}")

        # 2. Try Gemini fallback
        gemini_text = extract_text_with_gemini(image_bytes)
        if gemini_text:
            logger.info("✅ Text extracted using Gemini Vision fallback.")
            return gemini_text

        # 3. Final failure message
        if not GOOGLE_API_KEY:
            return "ERROR: OCR engine failed and no Gemini API key set for fallback. Please ensure the image is clear."
        
        return "ERROR: Could not extract text from image. Please ensure the image is clear or use manual entry."

    except Exception as e:
        logger.error(f"OCR Service Error: {str(e)}")
        return f"ERROR: Failed to process image. {str(e)}"
