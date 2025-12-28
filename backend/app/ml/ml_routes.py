from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.ml.ml_service import check_interaction
from app.ml.ai_service import chat_with_ai, analyze_medications

router = APIRouter(prefix="/ml", tags=["ML"])

class MLRequest(BaseModel):
    drug1: str
    drug2: str
    user_id: int

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

class AnalysisRequest(BaseModel):
    drugs: List[str]
    is_caregiver_mode: bool = False

@router.post("/check")
def check(request: MLRequest):
    level, confidence = check_interaction(
        request.drug1,
        request.drug2,
        request.user_id
    )

    return {
        "level": level,
        "confidence": round(confidence, 2)
    }

@router.post("/chat")
def chat(request: ChatRequest):
    response = chat_with_ai(request.message, request.history)
    if response.startswith("ERROR:"):
        raise HTTPException(status_code=500, detail=response)
    return {"response": response}

@router.post("/analyze")
def analyze(request: AnalysisRequest):
    result = analyze_medications(request.drugs, request.is_caregiver_mode)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
