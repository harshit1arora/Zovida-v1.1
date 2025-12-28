from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from app.database import init_db
from app.auth.auth_routes import router as auth_router
from app.ml.ml_routes import router as ml_router
from app.prescriptions.prescription_routes import router as prescription_router
from app.history.history_routes import router as history_router
from app.users.user_routes import router as user_router
from app.reminders.reminders_routes import router as reminders_router
from app.family.family_routes import router as family_router
from app.passport.passport_routes import router as passport_router
from app.community.community_routes import router as community_router
from app.alerts.alerts_routes import router as alerts_router

app = FastAPI(title="Zovida Backend")

# ✅ Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Initialize database on startup
@app.on_event("startup")
def startup():
    init_db()

# ✅ Register routers
app.include_router(auth_router)
app.include_router(ml_router)
app.include_router(prescription_router)
app.include_router(history_router)
app.include_router(user_router)
app.include_router(reminders_router)
app.include_router(family_router)
app.include_router(passport_router)
app.include_router(community_router)
app.include_router(alerts_router)

@app.get("/")
def root():
    return {"status": "MedixAI backend running"}
