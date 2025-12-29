from itertools import combinations
from app.ml.ml_service import check_interaction
from app.database import get_db
from app.prescriptions.ocr_service import extract_text
from app.prescriptions.drug_dictionary import load_known_drugs
from app.prescriptions.lifestyle_service import get_lifestyle_warnings
from app.cosmos_service import cosmos_service, CONTAINER_INTERACTIONS
import re
import datetime
import uuid

KNOWN_DRUGS = load_known_drugs()

def extract_drugs(text: str):
    words = re.findall(r"[A-Za-z]+", text.lower())
    extracted = set()

    # Single-word drugs
    for word in words:
        if word in KNOWN_DRUGS:
            extracted.add(word.title())

    # Two-word drugs (e.g., calcium carbonate)
    for i in range(len(words) - 1):
        pair = f"{words[i]} {words[i+1]}"
        if pair in KNOWN_DRUGS:
            extracted.add(pair.title())

    return list(extracted)

def process_prescription(user_id: int, text: str):
    drugs = extract_drugs(text)
    interactions = []

    conn = get_db()
    cursor = conn.cursor()

    # If multiple drugs, check for interactions
    if len(drugs) >= 2:
        for d1, d2 in combinations(drugs, 2):
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

    return {
        "interactions": interactions,
        "lifestyle": lifestyle_warnings
    }
