from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import get_db
import json

router = APIRouter(prefix="/reminders", tags=["Reminders"])

class ReminderBase(BaseModel):
    medicine_name: str
    dosage: str
    time: str
    days: List[str]

class ReminderCreate(ReminderBase):
    user_id: int

class ReminderUpdate(BaseModel):
    medicine_name: str = None
    dosage: str = None
    time: str = None
    days: List[str] = None
    is_active: bool = None

@router.get("/{user_id}")
async def get_reminders(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reminders WHERE user_id = ?", (user_id,))
    reminders = cursor.fetchall()
    conn.close()
    
    result = []
    for r in reminders:
        result.append({
            "id": r["id"],
            "medicineName": r["medicine_name"],
            "dosage": r["dosage"],
            "time": r["time"],
            "days": json.loads(r["days"]),
            "isActive": bool(r["is_active"])
        })
    return result

@router.post("/")
async def create_reminder(reminder: ReminderCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reminders (user_id, medicine_name, dosage, time, days, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (reminder.user_id, reminder.medicine_name, reminder.dosage, reminder.time, json.dumps(reminder.days), 1))
    conn.commit()
    reminder_id = cursor.lastrowid
    conn.close()
    return {"id": reminder_id, "status": "success"}

@router.patch("/{reminder_id}")
async def update_reminder(reminder_id: int, reminder: ReminderUpdate):
    conn = get_db()
    cursor = conn.cursor()
    
    fields = []
    params = []
    
    if reminder.medicine_name is not None:
        fields.append("medicine_name = ?")
        params.append(reminder.medicine_name)
    if reminder.dosage is not None:
        fields.append("dosage = ?")
        params.append(reminder.dosage)
    if reminder.time is not None:
        fields.append("time = ?")
        params.append(reminder.time)
    if reminder.days is not None:
        fields.append("days = ?")
        params.append(json.dumps(reminder.days))
    if reminder.is_active is not None:
        fields.append("is_active = ?")
        params.append(1 if reminder.is_active else 0)
        
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    params.append(reminder_id)
    query = f"UPDATE reminders SET {', '.join(fields)} WHERE id = ?"
    
    cursor.execute(query, params)
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}
