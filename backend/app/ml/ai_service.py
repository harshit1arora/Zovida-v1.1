
import os
import json
import logging
from groq import Groq
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Keys and Clients
def get_groq_config():
    return os.getenv("GROQ_API_KEY")

def get_google_config():
    return os.getenv("GOOGLE_API_KEY")

groq_client = None
def init_groq():
    global groq_client
    api_key = get_groq_config()
    if api_key and not groq_client:
        try:
            groq_client = Groq(api_key=api_key)
            logger.info("✅ Groq client initialized.")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Groq: {str(e)}")
    return groq_client

gemini_client = None
def init_gemini():
    global gemini_client
    api_key = get_google_config()
    if api_key and not gemini_client:
        try:
            gemini_client = genai.Client(api_key=api_key)
            logger.info("✅ Gemini (new SDK) configured for analysis.")
        except Exception as e:
            logger.error(f"❌ Failed to configure Gemini: {str(e)}")
    return gemini_client

# Initial attempt
init_groq()
init_gemini()

def chat_with_ai(message: str, history: list = None):
    groq_c = init_groq()
    gemini_c = init_gemini()
    
    if not groq_c and not gemini_c:
        return "ERROR: No AI service (Groq or Gemini) configured on server."

    if history is None:
        history = []

    system_prompt = """You are Zovida, a medical AI assistant for an Imagine Cup project.
    Your goal is to help users understand medication safety, interactions, and side effects.
    
    CRITICAL INSTRUCTIONS:
    1. If a user asks to consult a doctor, talk to a professional, or shows symptoms that require medical attention, you MUST include the tag "[navigate:doctors]" at the end of your response to help them redirect.
    2. Keep responses concise, professional, and empathetic.
    3. Always advise users to consult with a real healthcare provider for final medical decisions.
    4. You can provide information about common drug-drug interactions if asked.
    5. If a user is in a medical emergency, feels severe pain, or needs immediate help, you MUST include the tag "[navigate:sos]" at the end of your response to trigger the emergency SOS mode.
    """

    # Try Groq first
    if groq_c:
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                *history,
                {"role": "user", "content": message}
            ]

            completion = groq_c.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.5,
                max_tokens=1024,
            )

            return completion.choices[0].message.content or "I couldn't generate a response."
        except Exception as e:
            logger.error(f"Groq Chat Error: {str(e)}")
            # Fall through to Gemini

    # Try Gemini fallback
    if gemini_c:
        try:
            full_prompt = f"{system_prompt}\n\nUser: {message}"
            response = gemini_c.models.generate_content(
                model='gemini-1.5-flash',
                contents=full_prompt
            )
            return response.text or "I couldn't generate a response via Gemini."
        except Exception as e:
            logger.error(f"Gemini Chat Error: {str(e)}")

    return "ERROR: All AI services failed to generate a response."

def analyze_medications(drugs: list, is_caregiver_mode: bool = False):
    groq_c = init_groq()
    gemini_c = init_gemini()
    
    if not groq_c and not gemini_c:
        return {"error": "No AI service (Groq or Gemini) configured on server."}

    prompt = f"""Analyze these medications for components, interactions, and safety: {', '.join(drugs)}. 
    Return ONLY a JSON object following this structure:
    {{
      "id": "manual-analysis",
      "timestamp": "ISO_TIMESTAMP",
      "medicines": [
        {{ "id": "1", "name": "Drug Name", "dosage": "Standard Dosage", "frequency": "Standard Frequency", "components": ["Component 1", "Component 2"] }}
      ],
      "overallRisk": "safe" | "caution" | "danger",
      "interactions": [
        {{ "drug1": "Drug A", "drug2": "Drug B", "severity": "danger", "description": "Interaction detail", "recommendation": "What to do" }}
      ],
      "aiExplanation": "Brief overall summary (medical terminology)",
      "simpleExplanation": "ELI12 version - extremely simple language, no jargon",
      "doctorRating": {{ "totalReviews": 100, "averageScore": 4.5, "safeRatings": 80, "cautionRatings": 15, "dangerRatings": 5 }},
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "ocrConfidence": "High",
      "ocrConfidenceReason": "Manually entered by user",
      "safetyTimeline": {{
        "urgency": "Immediate" | "Soon" | "Routine",
        "message": "When should the user act on this analysis?"
      }},
      "sideEffects": ["Common side effect 1", "Common side effect 2"],
      "emergencySigns": ["Sign 1"],
      "crossPrescription": {{
        "detected": true,
        "sourceCount": 2,
        "message": "Found medications likely from different doctors."
      }},
      "isCaregiverMode": {str(is_caregiver_mode).lower()},
      "lifestyleWarnings": [
        {{ 
          "type": "alcohol" | "food" | "supplement" | "lifestyle", 
          "warning": "Specific substance/activity", 
          "impact": "What happens if combined",
          "action": "avoid" | "eat" | "monitor"
        }}
      ]
    }}"""

    # Try Groq first
    if groq_c:
        try:
            completion = groq_c.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a medical analysis AI. Return only JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
            )
            content = completion.choices[0].message.content
            # Robust JSON extraction
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(content[start:end])
            return json.loads(content)
        except Exception as e:
            logger.error(f"Groq Analysis Error: {str(e)}")
            # Fall through to Gemini

    # Try Gemini fallback
    if gemini_c:
        try:
            response = gemini_c.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt
            )
            # Find JSON in the response
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(text[start:end])
        except Exception as e:
            logger.error(f"Gemini Analysis Error: {str(e)}")

    return {"error": "All AI services failed to analyze medications."}
