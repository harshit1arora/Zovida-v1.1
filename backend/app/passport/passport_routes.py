from fastapi import APIRouter, HTTPException, Body
from app.database import get_db
from app.cosmos_service import cosmos_service, CONTAINER_PASSPORT
import json
from pydantic import BaseModel
from typing import Optional
import datetime

router = APIRouter(prefix="/passport", tags=["Passport"])

class PassportCreate(BaseModel):
    id: str
    user_id: Optional[int] = None
    data: dict

@router.post("/save")
def save_passport(passport: PassportCreate):
    # Prepare item for Cosmos DB
    cosmos_item = {
        "id": passport.id,
        "user_id": passport.user_id,
        "data": passport.data,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    
    # 1. Save to Cosmos DB (Primary storage for Passport)
    cosmos_service.save_item(CONTAINER_PASSPORT, cosmos_item)
    
    # 2. Keep SQLite as fallback/local cache
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT OR REPLACE INTO passports (id, user_id, data) VALUES (?, ?, ?)",
            (passport.id, passport.user_id, json.dumps(passport.data))
        )
        conn.commit()
        return {"status": "success", "message": "Passport saved to cloud and local cache"}
    except Exception as e:
        # If SQLite fails but Cosmos worked, we still consider it a partial success
        return {"status": "partial_success", "message": "Saved to cloud, local cache failed"}
    finally:
        conn.close()

@router.get("/{passport_id}")
def get_passport(passport_id: str):
    # 1. Try Cosmos DB first
    cosmos_item = cosmos_service.get_item(CONTAINER_PASSPORT, passport_id)
    if cosmos_item:
        return cosmos_item["data"]
        
    # 2. Fallback to SQLite
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM passports WHERE id = ?", (passport_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return json.loads(row["data"])
    else:
        raise HTTPException(status_code=404, detail="Passport not found")
