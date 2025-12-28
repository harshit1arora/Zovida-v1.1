from fastapi import APIRouter, HTTPException, Body
from app.database import get_db
from app.users.user_model import UserUpdate, UserResponse
from typing import Any

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/profile/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int):
    return get_user(user_id)

@router.put("/profile/{user_id}", response_model=UserResponse)
def update_user_profile(user_id: int, profile_data: UserUpdate = Body(...)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    update_fields = []
    values = []
    
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = ?")
            values.append(value)
    
    if not update_fields:
        conn.close()
        return get_user(user_id)
    
    values.append(user_id)
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
    
    try:
        cursor.execute(query, tuple(values))
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))
    
    conn.close()
    return get_user(user_id)
