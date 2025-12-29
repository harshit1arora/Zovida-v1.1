import os
import requests
import uuid
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Azure Translator Configuration
KEY = os.getenv("AZURE_TRANSLATOR_KEY")
ENDPOINT = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com/")
REGION = os.getenv("AZURE_TRANSLATOR_REGION", "centralindia")

def translate_text(text, target_language):
    """
    Translate text using Azure AI Translator
    """
    if not KEY:
        logger.error("❌ Azure Translator Key is missing")
        return text

    path = '/translate'
    constructed_url = ENDPOINT + path

    params = {
        'api-version': '3.0',
        'to': target_language
    }

    headers = {
        'Ocp-Apim-Subscription-Key': KEY,
        'Ocp-Apim-Subscription-Region': REGION,
        'Content-type': 'application/json',
        'X-ClientTraceId': str(uuid.uuid4())
    }

    # You can pass more than one object in body.
    body = [{
        'text': text
    }]

    try:
        request = requests.post(constructed_url, params=params, headers=headers, json=body)
        response = request.json()
        
        if request.status_code == 200:
            return response[0]['translations'][0]['text']
        else:
            logger.error(f"❌ Translation failed: {response}")
            return text
    except Exception as e:
        logger.error(f"❌ Error in translation service: {str(e)}")
        return text

def translate_batch(texts, target_language):
    """
    Translate a list of strings in a single batch call
    """
    if not KEY or not texts:
        return texts

    path = '/translate'
    constructed_url = ENDPOINT + path

    params = {
        'api-version': '3.0',
        'to': target_language
    }

    headers = {
        'Ocp-Apim-Subscription-Key': KEY,
        'Ocp-Apim-Subscription-Region': REGION,
        'Content-type': 'application/json',
        'X-ClientTraceId': str(uuid.uuid4())
    }

    body = [{'text': t} for t in texts]

    try:
        request = requests.post(constructed_url, params=params, headers=headers, json=body)
        response = request.json()
        
        if request.status_code == 200:
            return [res['translations'][0]['text'] for res in response]
        else:
            logger.error(f"❌ Batch translation failed: {response}")
            return texts
    except Exception as e:
        logger.error(f"❌ Error in batch translation service: {str(e)}")
        return texts
