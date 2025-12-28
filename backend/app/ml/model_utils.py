import joblib
import numpy as np

def predict_interaction(drug1, drug2, model, vectorizer, label_encoder):
    pair = " + ".join(sorted([drug1.lower(), drug2.lower()]))
    vector = vectorizer.transform([pair])

    probs = model.predict_proba(vector)[0]
    idx = np.argmax(probs)

    level = label_encoder.inverse_transform([idx])[0]
    confidence = probs[idx] * 100

    return level, confidence
