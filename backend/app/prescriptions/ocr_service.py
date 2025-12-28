import os
import logging
import io
from PIL import Image
import google.generativeai as genai
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Azure AI Vision Credentials
AZURE_VISION_KEY = os.getenv("AZURE_VISION_KEY")
AZURE_VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT", "https://zovida-foundry.cognitiveservices.azure.com/")

# Load API key for Gemini Fallback
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("✅ Gemini Vision fallback configured.")

def extract_text_with_azure(image_bytes):
    """Extract text using Azure AI Vision (Computer Vision)"""
    if not AZURE_VISION_KEY:
        logger.error("❌ Azure AI Vision Key is missing.")
        return None
        
    try:
        # Create a client
        client = ImageAnalysisClient(
            endpoint=AZURE_VISION_ENDPOINT,
            credential=AzureKeyCredential(AZURE_VISION_KEY)
        )

        # Analyze the image
        result = client.analyze(
            image_data=image_bytes,
            visual_features=[VisualFeatures.READ]
        )

        # Extract detected text
        if result.read is not None:
            extracted_lines = []
            for block in result.read.blocks:
                for line in block.lines:
                    extracted_lines.append(line.text)
            
            text = " ".join(extracted_lines)
            if text.strip():
                logger.info("✅ Text extracted using Azure AI Vision.")
                return text.strip()
        
        return None
    except Exception as e:
        logger.error(f"Azure AI Vision Error: {str(e)}")
        return None

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
        
        # 1. Try Azure AI Vision first
        azure_text = extract_text_with_azure(image_bytes)
        if azure_text:
            return azure_text

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
