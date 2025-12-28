from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.auth.auth_service import register_user, login_user, generate_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Auth"])

class AuthRequest(BaseModel):
    name: str = None
    email: str = None
    phone: str = None
    password: str = None
    otp_code: str = None

@router.post("/request-otp")
def request_otp(data: AuthRequest):
    if not data.email and not data.phone:
        raise HTTPException(status_code=400, detail="Email or Phone is required")
    
    code = generate_otp(email=data.email, phone=data.phone)
    if code:
        identifier = data.email if data.email else data.phone
        print(f"DEBUG: OTP for {identifier} is {code}")
        return {"message": "OTP sent successfully", "code": code}
    raise HTTPException(status_code=500, detail="Failed to generate OTP")

@router.post("/login-otp")
def login_otp(data: AuthRequest):
    if not data.otp_code:
        raise HTTPException(status_code=400, detail="OTP code is required")
    
    user = verify_otp(email=data.email, phone=data.phone, code=data.otp_code)
    if user:
        return {
            "message": "Login successful",
            "user_id": user["id"] if isinstance(user, dict) else user[0]
        }
    return {"error": "Invalid or expired OTP"}

@router.post("/register")
def register(data: AuthRequest):
    success = register_user(data.email, data.password, data.name, data.phone)
    if not success:
        return {"error": "Email/Phone already registered or registration failed"}
    return {"message": "User registered successfully"}

@router.post("/login")
def login(data: AuthRequest):
    user = login_user(data.email, data.password)
    if user:
        return {
            "message": "Login successful",
            "user_id": user["id"] if "id" in user.keys() else user[0]
        }
    return {"error": "Invalid email or password"}
