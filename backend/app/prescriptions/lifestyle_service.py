
import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

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

    # Try to get from Groq first
    try:
        drug_list_str = ", ".join(drugs)
        prompt = f"""
        Analyze the following drugs and provide food and lifestyle recommendations (what to eat vs what to avoid/monitor).
        Drugs: {drug_list_str}

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

        completion = client.chat.completions.create(
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
        
        all_warnings = []
        # Handle different JSON structures Groq might return
        if isinstance(data, list):
            all_warnings = data
        elif isinstance(data, dict):
            # Check if it's a nested dict like {"Aspirin": [...], "Metformin": [...]}
            # or wrapped like {"recommendations": [...]}
            for key, value in data.items():
                if isinstance(value, list):
                    all_warnings.extend(value)
                elif isinstance(value, dict):
                    # One more level of nesting just in case
                    for sub_key, sub_value in value.items():
                        if isinstance(sub_value, list):
                            all_warnings.extend(sub_value)
        
        if all_warnings:
            # Deduplicate by warning title
            seen = set()
            unique_warnings = []
            for w in all_warnings:
                if w.get('warning') not in seen:
                    unique_warnings.append(w)
                    seen.add(w.get('warning'))
            return unique_warnings

    except Exception as e:
        print(f"Error fetching from Groq: {e}")

    # Fallback to local dictionary
    warnings = []
    seen_warnings = set()
    
    for drug in drugs:
        drug_name = drug.title()
        if drug_name in DRUG_LIFESTYLE_INTERACTIONS:
            for interaction in DRUG_LIFESTYLE_INTERACTIONS[drug_name]:
                warning_key = f"{interaction['type']}:{interaction['warning']}"
                if warning_key not in seen_warnings:
                    warnings.append(interaction)
                    seen_warnings.add(warning_key)
                    
    return warnings
