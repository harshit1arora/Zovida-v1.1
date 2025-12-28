from fastapi import APIRouter
from pydantic import BaseModel
from app.ml.ml_service import check_interaction

router = APIRouter(prefix="/ml", tags=["ML"])

class MLRequest(BaseModel):
    drug1: str
    drug2: str
    user_id: int

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
