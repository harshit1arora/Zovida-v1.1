import os
import logging
import io
from PIL import Image
import google.generativeai as genai
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Azure AI Vision Credentials
AZURE_VISION_KEY = os.getenv("AZURE_VISION_KEY")
AZURE_VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT", "https://zovida-foundry.cognitiveservices.azure.com/")
AZURE_VISION_REGION = os.getenv("AZURE_VISION_REGION", "centralindia")

# Load API key for Gemini Fallback
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        logger.info("✅ Gemini Vision fallback configured.")
    except Exception as e:
        logger.error(f"❌ Failed to configure Gemini: {str(e)}")

def extract_text_with_azure(image_bytes):
    """Extract text using Azure AI Vision (Computer Vision)"""
    if not AZURE_VISION_KEY:
        logger.error("❌ Azure AI Vision Key is missing from environment.")
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
        
        logger.warning("⚠️ Azure AI Vision returned no text.")
        return None
    except Exception as e:
        logger.error(f"❌ Azure AI Vision Error: {str(e)}")
        return None

def extract_text_with_gemini(image_bytes):
    if not GOOGLE_API_KEY:
        logger.warning("⚠️ Gemini API key missing, skipping fallback.")
        return None
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        content = [
            "Extract all text from this medical prescription. Only return the text found, no explanations.",
            {"mime_type": "image/jpeg", "data": image_bytes}
        ]
        response = model.generate_content(content)
        if response and response.text:
            return response.text.strip()
        return None
    except Exception as e:
        logger.error(f"❌ Gemini OCR Error: {str(e)}")
        return None

def extract_text(file):
    try:
        # Read file bytes
        image_bytes = file.file.read()
        
        if not image_bytes:
            return "ERROR: Empty file uploaded."

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
        error_msg = "ERROR: "
        if not AZURE_VISION_KEY and not GOOGLE_API_KEY:
            error_msg += "No OCR services (Azure or Gemini) are configured. Please check your server configuration."
        elif not GOOGLE_API_KEY:
            error_msg += "Azure AI Vision failed and no Gemini API key is configured for fallback. Please check your credentials."
        else:
            error_msg += "Azure and Gemini both failed to read the prescription. Please ensure the image is clear or use manual entry."
        
        return error_msg

    except Exception as e:
        logger.error(f"❌ OCR Service Error: {str(e)}")
        return f"ERROR: Failed to process image. {str(e)}"
