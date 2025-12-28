
import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def chat_with_ai(message: str, history: list = None):
    if not GROQ_API_KEY:
        return "ERROR: Groq API key not configured on server."

    if history is None:
        history = []

    try:
        system_prompt = """You are Zovida, a medical AI assistant for an Imagine Cup project.
        Your goal is to help users understand medication safety, interactions, and side effects.
        
        CRITICAL INSTRUCTIONS:
        1. If a user asks to consult a doctor, talk to a professional, or shows symptoms that require medical attention, you MUST include the tag "[navigate:doctors]" at the end of your response to help them redirect.
        2. Keep responses concise, professional, and empathetic.
        3. Always advise users to consult with a real healthcare provider for final medical decisions.
        4. You can provide information about common drug-drug interactions if asked.
        5. If a user is in a medical emergency, feels severe pain, or needs immediate help, you MUST include the tag "[navigate:sos]" at the end of your response to trigger the emergency SOS mode.
        """

        messages = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": message}
        ]

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.5,
            max_tokens: 1024,
        )

        return completion.choices[0].message.content or "I couldn't generate a response."
    except Exception as e:
        return f"ERROR: AI Service error: {str(e)}"

def analyze_medications(drugs: list, is_caregiver_mode: bool = False):
    if not GROQ_API_KEY:
        return {"error": "Groq API key not configured on server."}

    try:
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

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a medical analysis AI. Return only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={ "type": "json_object" }
        )

        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        return {"error": f"AI Analysis error: {str(e)}"}
