from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from app.prescriptions.prescription_service import process_prescription
from app.prescriptions.ocr_service import extract_text

from typing import List

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

class ManualEntryRequest(BaseModel):
    user_id: int
    drugs: List[str]

@router.post("/scan")
async def scan_prescription(
    user_id: int = Form(...),
    file: UploadFile = File(...)
):
    text = extract_text(file)
    analysis = process_prescription(user_id, text)

    return {
        "extracted_text": text,
        "analysis": analysis
    }

@router.post("/manual")
async def manual_entry(data: ManualEntryRequest):
    # For manual entry, we already have the drugs, so we join them to simulate text 
    # or we can modify process_prescription to take a list of drugs.
    # Let's just join them for now to reuse process_prescription.
    text = " ".join(data.drugs)
    analysis = process_prescription(data.user_id, text)
    
    return {
        "drugs": data.drugs,
        "analysis": analysis
    }
