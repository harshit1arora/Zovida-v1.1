from app.database import get_db
from app.ml.model_utils import predict_interaction
import joblib
import os

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

model = joblib.load(os.path.join(MODEL_DIR, "interaction_model.pkl"))
vectorizer = joblib.load(os.path.join(MODEL_DIR, "vectorizer.pkl"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))

def check_interaction(drug1: str, drug2: str, user_id: int = None):
    level, confidence = predict_interaction(
        drug1, drug2, model, vectorizer, label_encoder
    )

    # ✅ SAVE TO HISTORY IF USER PROVIDED
    if user_id is not None:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO history (user_id, drug1, drug2, level, confidence)
        VALUES (?, ?, ?, ?, ?)
        """, (user_id, drug1, drug2, level, confidence))

        conn.commit()
        conn.close()

    return level, confidence
