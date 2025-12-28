from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.database import get_db
import sqlite3

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertResponse(BaseModel):
    id: int
    type: str
    title: str
    description: str
    region: str
    cases_reported: int
    severity: str
    timestamp: str

@router.get("/", response_model=List[AlertResponse])
def get_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM health_alerts ORDER BY timestamp DESC LIMIT 20")
    rows = cursor.fetchall()
    
    # If no alerts, seed some mock data for demo
    if not rows:
        mock_alerts = [
            ("outbreak", "Rising Flu Cases", "Significant increase in seasonal flu reported across the city.", "Northern Region", 1250, "medium"),
            ("statistic", "Dengue Alert", "45 new cases of Dengue reported in the last 24 hours.", "Downtown", 45, "high"),
            ("event", "Vaccination Drive", "Free polio vaccination camp at City Hospital this Sunday.", "All Regions", 0, "low")
        ]
        for alert in mock_alerts:
            cursor.execute(
                "INSERT INTO health_alerts (type, title, description, region, cases_reported, severity) VALUES (?, ?, ?, ?, ?, ?)",
                alert
            )
        conn.commit()
        cursor.execute("SELECT * FROM health_alerts ORDER BY timestamp DESC LIMIT 20")
        rows = cursor.fetchall()

    return [AlertResponse(**dict(row)) for row in rows]

@router.post("/report")
def report_statistic(alert_type: str, title: str, description: str, cases: int, region: str, severity: str = "medium"):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO health_alerts (type, title, description, cases_reported, region, severity) VALUES (?, ?, ?, ?, ?, ?)",
            (alert_type, title, description, cases, region, severity)
        )
        conn.commit()
        return {"status": "success", "message": "Alert/Statistic reported"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
