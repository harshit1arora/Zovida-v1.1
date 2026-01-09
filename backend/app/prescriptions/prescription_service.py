from itertools import combinations
from app.ml.ml_service import check_interaction
from app.database import get_db
from app.prescriptions.ocr_service import extract_text, init_gemini
from app.prescriptions.drug_dictionary import load_known_drugs
from app.prescriptions.lifestyle_service import get_lifestyle_warnings
from app.cosmos_service import cosmos_service, CONTAINER_INTERACTIONS
import re
import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

# Load from CSV and add common drugs as backup
KNOWN_DRUGS = load_known_drugs()

# Add common medications that might be missing from the CSV
COMMON_DRUGS = {
    "alcohol", "codeine", "ibuprofen", "aspirin", "paracetamol", "acetaminophen", 
    "amoxicillin", "metformin", "simvastatin", "lisinopril", "omeprazole",
    "sertraline", "warfarin", "prednisone", "hydrocodone", "oxycodone",
    "tramadol", "diazepam", "alprazolam", "ciprofloxacin"
}

# Merge with existing drugs
KNOWN_DRUGS.update(COMMON_DRUGS)

# Add common typos mapping
DRUG_TYPOS = {
    "ibupro": "ibuprofen",
    "ibuprufen": "ibuprofen",
    "ibuprofin": "ibuprofen",
    "codein": "codeine",
    "paracet": "paracetamol",
    "metform": "metformin"
}

# Dangerous interactions that should always be flagged
DANGEROUS_INTERACTIONS = {
    # Opioid + NSAID combinations
    ("codeine", "ibuprofen"): "Major",
    ("hydrocodone", "ibuprofen"): "Major",
    ("oxycodone", "ibuprofen"): "Major",
    # Alcohol with various drugs
    ("alcohol", "codeine"): "Major",
    ("alcohol", "ibuprofen"): "Major",
    ("alcohol", "paracetamol"): "Major",
    ("alcohol", "aspirin"): "Moderate",
    ("alcohol", "diazepam"): "Major",
    # Multiple CNS depressants
    ("codeine", "diazepam"): "Major",
    ("alcohol", "diazepam"): "Major"
}

def extract_drugs_with_gemini(text: str):
    """Fallback to Gemini for identifying drugs in text if dictionary fails"""
    client = init_gemini()
    if not client:
        return []
    
    try:
        prompt = f"""
        Extract a list of medication names from the following prescription text. 
        Only return the drug names separated by commas. Do not include dosages or instructions.
        If no drugs are found, return "None".
        
        Text: {text}
        """
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[prompt]
        )
        if response and response.text:
            result = response.text.strip()
            if result.lower() == "none":
                return []
            # Split by comma and clean up
            drugs = [d.strip().title() for d in result.split(",")]
            return [d for d in drugs if d]
        return []
    except Exception as e:
        logger.error(f"❌ Gemini Drug Extraction Error: {str(e)}")
        return []

def extract_drugs(text: str):
    words = re.findall(r"[A-Za-z]+", text.lower())
    extracted = set()

    # Handle typos and partial matches
    processed_words = []
    for word in words:
        # Check if word is a typo that should be corrected
        if word in DRUG_TYPOS:
            processed_words.append(DRUG_TYPOS[word])
        else:
            # Check if it's a partial match for any drug
            partial_match = None
            for drug in KNOWN_DRUGS:
                if len(word) > 3 and word in drug:
                    partial_match = drug
                    break
            if partial_match:
                processed_words.append(partial_match)
            else:
                processed_words.append(word)

    # Single-word drugs
    for word in processed_words:
        if word in KNOWN_DRUGS:
            extracted.add(word.title())

    # Two-word drugs (e.g., calcium carbonate)
    for i in range(len(processed_words) - 1):
        pair = f"{processed_words[i]} {processed_words[i+1]}"
        if pair in KNOWN_DRUGS:
            extracted.add(pair.title())

    # Log the extracted drugs for debugging
    logger.info(f"🔍 Extracted drugs: {extracted}")

    # If nothing found, try Gemini fallback
    if not extracted and text.strip():
        logger.info("🔄 No drugs found in dictionary. Trying Gemini drug extraction...")
        gemini_drugs = extract_drugs_with_gemini(text)
        if gemini_drugs:
            logger.info(f"✅ Gemini identified drugs: {gemini_drugs}")
            return gemini_drugs

    return list(extracted)

def get_interaction_explanations(interactions):
    """Get detailed explanations for each interaction using Groq API"""
    if not interactions:
        return []
    
    from app.prescriptions.lifestyle_service import init_groq
    
    groq_client = init_groq()
    if not groq_client:
        return []
    
    # Prepare prompt for Groq - only include valid interactions with both drugs
    valid_interactions = [i for i in interactions if i['drug1'] and i['drug2']]
    if not valid_interactions:
        return []
    
    interaction_details = []
    for interaction in valid_interactions:
        drug1 = interaction['drug1']
        drug2 = interaction['drug2']
        level = interaction['level']
        interaction_details.append(f"{drug1} + {drug2}: {level} interaction")
    
    prompt = f"""
    Explain the following drug interactions in simple, easy-to-understand language:
    {', '.join(interaction_details)}
    
    For each interaction, provide:
    1. A clear explanation of what happens when these drugs are taken together
    2. The specific risks or side effects that could occur
    3. A simple recommendation for the patient
    
    Return the response as a JSON array of objects with the following structure:
    [
        {{
            "drug1": "Drug Name 1",
            "drug2": "Drug Name 2",
            "explanation": "Simple explanation",
            "risks": "Specific risks",
            "recommendation": "Patient recommendation"
        }}
    ]
    
    Make sure the language is conversational, not too technical, and focused on patient safety.
    Ensure the output is valid JSON and nothing else.
    """
    
    try:
        import json
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a medical assistant explaining drug interactions in simple terms. Return only JSON."},
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
            # If wrapped in a key like "explanations" or "interactions"
            for key in ["explanations", "interactions", "data"]:
                if key in data and isinstance(data[key], list):
                    return data[key]
            return []
        else:
            return []
    except Exception as e:
        logger.error(f"❌ Groq Interaction Explanation Error: {str(e)}")
        return []

def process_prescription(user_id: int, text: str):
    drugs = extract_drugs(text)
    interactions = []

    conn = get_db()
    cursor = conn.cursor()

    # If multiple drugs, check for interactions
    if len(drugs) >= 2:
        for d1, d2 in combinations(drugs, 2):
            # Convert to lowercase for case-insensitive checking
            d1_lower = d1.lower()
            d2_lower = d2.lower()
            
            # First check our dangerous interactions dictionary
            dangerous_level = None
            if (d1_lower, d2_lower) in DANGEROUS_INTERACTIONS:
                dangerous_level = DANGEROUS_INTERACTIONS[(d1_lower, d2_lower)]
            elif (d2_lower, d1_lower) in DANGEROUS_INTERACTIONS:
                dangerous_level = DANGEROUS_INTERACTIONS[(d2_lower, d1_lower)]
            
            # If it's a dangerous interaction, use that level, otherwise check ML model
            if dangerous_level:
                level = dangerous_level
                confidence = 1.0  # High confidence for known dangerous interactions
                logger.info(f"⚠️  Found dangerous interaction: {d1} + {d2} = {level}")
            else:
                level, confidence = check_interaction(d1, d2)

            interaction_data = {
                "drug1": d1,
                "drug2": d2,
                "level": level,
                "confidence": confidence
            }
            interactions.append(interaction_data)

            # 1. Anonymized Cloud Logging (Cosmos DB)
            cosmos_item = {
                "id": str(uuid.uuid4()),
                "drug1": d1,
                "drug2": d2,
                "level": level,
                "confidence": confidence,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "is_anonymized": True
            }
            cosmos_service.save_item(CONTAINER_INTERACTIONS, cosmos_item)

            # 2. Local User History (SQLite)
            cursor.execute("""
                INSERT INTO history (user_id, drug1, drug2, level, confidence)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, d1, d2, level, confidence))
    
    # If only one drug, save it as a "Safe" entry with no second drug
    elif len(drugs) == 1:
        interaction_data = {
            "drug1": drugs[0],
            "drug2": None,
            "level": "Safe",
            "confidence": 1.0
        }
        interactions.append(interaction_data)
        
        cursor.execute("""
            INSERT INTO history (user_id, drug1, drug2, level, confidence)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, drugs[0], None, "Safe", 1.0))

    conn.commit()
    conn.close()

    # Get lifestyle warnings
    lifestyle_warnings = get_lifestyle_warnings(drugs)
    
    # Get detailed interaction explanations
    interaction_explanations = get_interaction_explanations(interactions)

    return {
        "interactions": interactions,
        "lifestyle": lifestyle_warnings,
        "interaction_explanations": interaction_explanations
    }
