
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
            logger.info("✅ Groq client initialized for lifestyle service.")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Groq for lifestyle: {str(e)}")
    return groq_client

gemini_client = None
def init_gemini():
    global gemini_client
    api_key = get_google_config()
    if api_key and not gemini_client:
        try:
            gemini_client = genai.Client(api_key=api_key)
            logger.info("✅ Gemini (new SDK) configured for lifestyle service.")
        except Exception as e:
            logger.error(f"❌ Failed to configure Gemini for lifestyle: {str(e)}")
    return gemini_client

# Initial attempt
init_groq()
init_gemini()

DRUG_LIFESTYLE_INTERACTIONS = {
    "Aspirin": [
        {"type": "alcohol", "warning": "Avoid alcohol", "impact": "Increases risk of stomach bleeding.", "action": "avoid"},
        {"type": "food", "warning": "Take with food", "impact": "Reduces stomach upset and irritation.", "action": "eat"}
    ],
    "Metformin": [
        {"type": "alcohol", "warning": "Limit alcohol", "impact": "Increases risk of lactic acidosis.", "action": "avoid"},
        {"type": "food", "warning": "Take with meals", "impact": "Improves absorption and reduces side effects.", "action": "eat"},
        {"type": "supplement", "warning": "Vitamin B12", "impact": "Long-term use can deplete B12 levels.", "action": "monitor"}
    ],
    "Atorvastatin": [
        {"type": "food", "warning": "Avoid Grapefruit", "impact": "Can increase drug levels in your blood.", "action": "avoid"},
        {"type": "alcohol", "warning": "Limit alcohol", "impact": "Increases risk of liver problems.", "action": "avoid"}
    ],
    "Amoxicillin": [
        {"type": "food", "warning": "Take with or without food", "impact": "Food does not significantly affect absorption.", "action": "eat"},
        {"type": "supplement", "warning": "Probiotics", "impact": "May help prevent antibiotic-associated diarrhea.", "action": "eat"}
    ],
    "Lisinopril": [
        {"type": "food", "warning": "Avoid excessive Potassium", "impact": "Can cause high potassium levels (hyperkalemia).", "action": "avoid"},
        {"type": "supplement", "warning": "Potassium supplements", "impact": "High risk of hyperkalemia.", "action": "avoid"}
    ],
    "Warfarin": [
        {"type": "food", "warning": "Consistent Vitamin K", "impact": "Sudden changes in Vitamin K (spinach, kale) affect efficacy.", "action": "monitor"},
        {"type": "food", "warning": "Avoid Cranberry Juice", "impact": "Can increase bleeding risk.", "action": "avoid"},
        {"type": "alcohol", "warning": "Avoid heavy drinking", "impact": "Significantly affects blood thinning.", "action": "avoid"}
    ],
    "Levothyroxine": [
        {"type": "food", "warning": "Take on empty stomach", "impact": "Food, coffee, and milk significantly reduce absorption.", "action": "avoid"},
        {"type": "supplement", "warning": "Calcium/Iron supplements", "impact": "Wait at least 4 hours after taking the drug.", "action": "avoid"}
    ],
    "Ibuprofen": [
        {"type": "food", "warning": "Take with food or milk", "impact": "Protects the stomach lining from irritation.", "action": "eat"},
        {"type": "alcohol", "warning": "Avoid alcohol", "impact": "Increases risk of gastrointestinal bleeding.", "action": "avoid"}
    ],
    "Calcium Carbonate": [
        {"type": "food", "warning": "Take with food", "impact": "Requires stomach acid for better absorption.", "action": "eat"}
    ],
    "Dolutegravir": [
        {"type": "supplement", "warning": "Avoid Cation supplements", "impact": "Calcium, Magnesium, Iron reduce absorption.", "action": "avoid"},
        {"type": "food", "warning": "Take with food if using supplements", "impact": "Helps overcome the binding with minerals.", "action": "monitor"}
    ]
}

def get_lifestyle_warnings(drugs):
    if not drugs:
        return []

    prompt = f"""
    Analyze the following drugs and provide food and lifestyle recommendations (what to eat vs what to avoid/monitor).
    Drugs: {", ".join(drugs)}

    Return ONLY a JSON array of objects with the following structure:
    {{
        "type": "food" | "alcohol" | "supplement" | "lifestyle",
        "warning": "Short descriptive title (e.g., 'Avoid Grapefruit')",
        "impact": "Brief explanation of the interaction or benefit",
        "action": "avoid" | "eat" | "monitor"
    }}

    Be specific for each drug. Focus on clinically significant interactions.
    If a drug has no specific lifestyle interactions, return an empty list for that drug.
    Ensure the output is valid JSON and nothing else.
    """

    # 1. Try Groq first
    groq_c = init_groq()
    if groq_c:
        try:
            completion = groq_c.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a medical assistant providing pharmacological lifestyle advice. Return only JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={ "type": "json_object" }
            )

            response_content = completion.choices[0].message.content
            data = json.loads(response_content)
            
            # Handle different JSON structures Groq might return
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                # If wrapped in a key like "recommendations" or "warnings"
                for key in ["recommendations", "warnings", "lifestyle", "data"]:
                    if key in data and isinstance(data[key], list):
                        return data[key]
                # If it's a list of objects but at the root level of the dict (unexpected but possible)
                return [data] if "type" in data else []
        except Exception as e:
            logger.error(f"Groq Lifestyle Error: {str(e)}")
            # Fall through to Gemini

    # 2. Try Gemini fallback
    gemini_c = init_gemini()
    if gemini_c:
        try:
            response = gemini_c.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt
            )
            text = response.text
            start = text.find('[')
            end = text.rfind(']') + 1
            if start != -1 and end != -1:
                return json.loads(text[start:end])
        except Exception as e:
            logger.error(f"Gemini Lifestyle Error: {str(e)}")

    # 3. Static fallback from local dictionary if AI fails
    all_warnings = []
    for drug in drugs:
        if drug.title() in DRUG_LIFESTYLE_INTERACTIONS:
            all_warnings.extend(DRUG_LIFESTYLE_INTERACTIONS[drug.title()])
    
    return all_warnings
