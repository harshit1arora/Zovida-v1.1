from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
import sqlite3
import json
import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

router = APIRouter(prefix="/community", tags=["Community"])

class PostCreate(BaseModel):
    user_id: int
    medication_profile: List[str]
    experience: str
    side_effects: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    medication_profile: List[str]
    experience: str
    side_effects: Optional[str]
    is_doctor_reviewed: bool
    timestamp: str

@router.post("/posts")
def create_post(post: PostCreate):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO community_posts (user_id, medication_profile, experience, side_effects) VALUES (?, ?, ?, ?)",
            (post.user_id, ",".join(post.medication_profile), post.experience, post.side_effects)
        )
        conn.commit()
        return {"status": "success", "message": "Post created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts", response_model=List[PostResponse])
def get_posts(meds: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
        SELECT cp.*, u.name as user_name 
        FROM community_posts cp
        JOIN users u ON cp.user_id = u.id
    """
    params = []
    
    if meds:
        query += " WHERE cp.medication_profile LIKE ?"
        params.append(f"%{meds}%")
        
    query += " ORDER BY cp.timestamp DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    return [
        PostResponse(
            id=row["id"],
            user_id=row["user_id"],
            user_name=row["user_name"],
            medication_profile=row["medication_profile"].split(","),
            experience=row["experience"],
            side_effects=row["side_effects"],
            is_doctor_reviewed=bool(row["is_doctor_reviewed"]),
            timestamp=row["timestamp"]
        ) for row in rows
    ]

@router.get("/stats/matching-profile")
def get_matching_stats(meds: str):
    conn = get_db()
    cursor = conn.cursor()
    
    # Simple logic: count people with at least one shared med
    med_list = meds.split(",")
    total_matches = 0
    seen_users = set()
    
    for med in med_list:
        cursor.execute("SELECT DISTINCT user_id FROM community_posts WHERE medication_profile LIKE ?", (f"%{med.strip()}%",))
        users = cursor.fetchall()
        for u in users:
            seen_users.add(u["user_id"])
            
    return {
        "count": len(seen_users),
        "message": f"{len(seen_users)} people with similar medication profiles share experiences"
    }

@router.get("/ai-summary")
def get_ai_summary(meds: str):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Fetch recent experiences for these meds
        cursor.execute(
            "SELECT experience, side_effects FROM community_posts WHERE medication_profile LIKE ? LIMIT 5",
            (f"%{meds}%",)
        )
        rows = cursor.fetchall()
        
        if not rows:
            return {"summary": "No community experiences shared yet for this medication combination."}
            
        experiences = [f"Exp: {r['experience']} | Side Effects: {r['side_effects']}" for r in rows]
        context = "\n".join(experiences)
        
        prompt = f"""
        Summarize the following patient experiences for the medication(s): {meds}.
        Identify common themes, effectiveness, and frequently reported side effects.
        Keep it concise and objective.
        
        Experiences:
        {context}
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a medical data analyst. Summarize patient experiences objectively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        return {"summary": completion.choices[0].message.content}
    except Exception as e:
        return {"summary": "AI summary currently unavailable."}
