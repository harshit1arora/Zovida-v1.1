from fastapi import APIRouter, HTTPException, Body
from app.translate_service import translate_text, translate_batch
from pydantic import BaseModel
from typing import List, Dict, Union

router = APIRouter(prefix="/translate", tags=["Translation"])

class TranslationRequest(BaseModel):
    text: Union[str, List[str]]
    target_lang: str

@router.post("/")
def translate(request: TranslationRequest):
    try:
        if isinstance(request.text, list):
            translated = translate_batch(request.text, request.target_lang)
            return {"translated": translated}
        else:
            translated = translate_text(request.text, request.target_lang)
            return {"translated": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
