from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import get_db

router = APIRouter(prefix="/family", tags=["Family"])

class FamilyMemberCreate(BaseModel):
    user_id: int
    name: str
    relation: str
    phone: str

class FamilyMemberUpdate(BaseModel):
    notifications: bool = None
    location_access: bool = None

@router.get("/{user_id}")
async def get_family(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM family WHERE user_id = ?", (user_id,))
    members = cursor.fetchall()
    conn.close()
    
    result = []
    for m in members:
        result.append({
            "id": str(m["id"]),
            "name": m["name"],
            "relation": m["relation"],
            "phone": m["phone"],
            "notifications": bool(m["notifications"]),
            "locationAccess": bool(m["location_access"])
        })
    return result

@router.post("/")
async def add_family_member(member: FamilyMemberCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO family (user_id, name, relation, phone, notifications, location_access)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (member.user_id, member.name, member.relation, member.phone, 1, 0))
    conn.commit()
    member_id = cursor.lastrowid
    conn.close()
    return {"id": str(member_id), "status": "success"}

@router.patch("/{member_id}")
async def update_family_member(member_id: int, update: FamilyMemberUpdate):
    conn = get_db()
    cursor = conn.cursor()
    
    fields = []
    params = []
    
    if update.notifications is not None:
        fields.append("notifications = ?")
        params.append(1 if update.notifications else 0)
    if update.location_access is not None:
        fields.append("location_access = ?")
        params.append(1 if update.location_access else 0)
        
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    params.append(member_id)
    query = f"UPDATE family SET {', '.join(fields)} WHERE id = ?"
    
    cursor.execute(query, params)
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.delete("/{member_id}")
async def delete_family_member(member_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM family WHERE id = ?", (member_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}
