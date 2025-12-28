from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/{user_id}")
def get_history(user_id: int):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, drug1, drug2, level, confidence, timestamp
        FROM history
        WHERE user_id = ?
        ORDER BY timestamp DESC
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]
