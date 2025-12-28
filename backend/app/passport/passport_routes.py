from fastapi import APIRouter, HTTPException, Body
from app.database import get_db
import json
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/passport", tags=["Passport"])

class PassportCreate(BaseModel):
    id: str
    user_id: Optional[int] = None
    data: dict

@router.post("/save")
def save_passport(passport: PassportCreate):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT OR REPLACE INTO passports (id, user_id, data) VALUES (?, ?, ?)",
            (passport.id, passport.user_id, json.dumps(passport.data))
        )
        conn.commit()
        return {"status": "success", "message": "Passport saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/{passport_id}")
def get_passport(passport_id: str):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT data FROM passports WHERE id = ?", (passport_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return json.loads(row["data"])
    else:
        raise HTTPException(status_code=404, detail="Passport not found")
