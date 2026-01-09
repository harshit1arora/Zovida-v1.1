import os
import logging
import io
from PIL import Image
from google import genai
from google.genai import types
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
def get_azure_config():
    return {
        "key": os.getenv("AZURE_VISION_KEY"),
        "endpoint": os.getenv("AZURE_VISION_ENDPOINT", "https://zovida-foundry.cognitiveservices.azure.com/"),
        "region": os.getenv("AZURE_VISION_REGION", "centralindia")
    }

# Load API key for Gemini Fallback
def get_google_config():
    # Use environment variable first, then the provided fallback key
    return os.getenv("GOOGLE_API_KEY", "AIzaSyB6wMBYRXxwAHJZesUN2VOCK1IbY-qCuYE")

gemini_client = None
def init_gemini():
    global gemini_client
    api_key = get_google_config()
    if api_key and not gemini_client:
        try:
            gemini_client = genai.Client(api_key=api_key)
            logger.info("✅ Gemini Vision (new SDK) fallback configured.")
        except Exception as e:
            logger.error(f"❌ Failed to configure Gemini: {str(e)}")
    return gemini_client

# Initial attempt
init_gemini()

def extract_text_with_azure(image_bytes):
    """Extract text using Azure AI Vision (Computer Vision)"""
    config = get_azure_config()
    if not config["key"]:
        logger.error("❌ Azure AI Vision Key is missing from environment.")
        return None
        
    try:
        # Create a client
        client = ImageAnalysisClient(
            endpoint=config["endpoint"],
            credential=AzureKeyCredential(config["key"])
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
    client = init_gemini()
    if not client:
        logger.warning("⚠️ Gemini client not initialized, skipping fallback.")
        return None
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                "Extract all text from this medical prescription. Only return the text found, no explanations.",
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
            ]
        )
        if response and response.text:
            return response.text.strip()
        return None
    except Exception as e:
        logger.error(f"❌ Gemini OCR Error: {str(e)}")
        return None

def extract_text(file):
    # Log configuration status for debugging
    azure_config = get_azure_config()
    google_key = get_google_config()
    
    logger.info(f"🔍 OCR Request Received. Config Status: Azure Key={'✅' if azure_config['key'] else '❌'}, Gemini Key={'✅' if google_key else '❌'}")
    
    try:
        # Read file bytes
        image_bytes = file.file.read()
        # Reset file pointer just in case
        file.file.seek(0)
        
        if not image_bytes:
            logger.error("❌ Empty file uploaded.")
            return "ERROR: Empty file uploaded."

        logger.info(f"📸 Image size: {len(image_bytes)} bytes")

        # 1. Try Azure AI Vision first
        azure_text = extract_text_with_azure(image_bytes)
        if azure_text:
            logger.info(f"✅ Text extracted using Azure AI Vision (length: {len(azure_text)})")
            logger.debug(f"Extracted Text: {azure_text[:200]}...")
            return azure_text

        # 2. Try Gemini fallback
        logger.info("🔄 Azure failed or returned no text. Trying Gemini fallback...")
        gemini_text = extract_text_with_gemini(image_bytes)
        if gemini_text:
            logger.info(f"✅ Text extracted using Gemini Vision fallback (length: {len(gemini_text)})")
            return gemini_text

        # 3. Final failure message
        azure_key = get_azure_config()["key"]
        google_key = get_google_config()
        
        error_msg = "ERROR: "
        if not azure_key and not google_key:
            error_msg += "No OCR services (Azure or Gemini) are configured in the environment variables."
        elif not google_key:
            error_msg += "Azure AI Vision failed and no Gemini API key is configured for fallback."
        else:
            error_msg += "Both Azure and Gemini OCR services failed to process the image."
        
        return error_msg

    except Exception as e:
        logger.error(f"❌ OCR Service Error: {str(e)}")
        return f"ERROR: Failed to process image. {str(e)}"
