from app.database import get_db
from app.auth.sms_service import request_phone_otp, check_phone_otp, request_whatsapp_otp
from app.cosmos_service import cosmos_service, CONTAINER_SESSIONS
import sqlite3
import random
import string
import uuid
from datetime import datetime, timedelta

def generate_otp(email=None, phone=None):
    conn = get_db()
    cursor = conn.cursor()
    
    # Generate 6-digit numeric OTP (still needed for email, or as a backup)
    code = ''.join(random.choices(string.digits, k=6))
    # Expires in 10 minutes
    expires_at = datetime.now() + timedelta(minutes=10)
    
    try:
        if email:
            email = email.lower().strip()
            # Clear existing OTPs for this email
            cursor.execute("DELETE FROM otps WHERE email = ?", (email,))
            # Insert new OTP
            cursor.execute(
                "INSERT INTO otps (email, code, expires_at) VALUES (?, ?, ?)",
                (email, code, expires_at)
            )
            conn.commit()
            
            return code
        elif phone:
            phone = phone.strip()
            # Use Twilio Verify API via WhatsApp
            success = request_whatsapp_otp(phone)
            if success:
                # We return a dummy code for the demo UI if needed, 
                # but Twilio Verify manages the real code.
                return "SENT"
            return None
        
        return None
    except Exception as e:
        print(f"OTP generation error: {e}")
        return None
    finally:
        conn.close()

def verify_otp(email=None, phone=None, code=None):
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.now()
    
    try:
        is_valid = False
        if email:
            email = email.lower().strip()
            cursor.execute(
                "SELECT * FROM otps WHERE email = ? AND code = ? AND expires_at > ?",
                (email, code, now)
            )
            otp_record = cursor.fetchone()
            is_valid = otp_record is not None
        elif phone:
            phone = phone.strip()
            # Use Twilio Verify API
            is_valid = check_phone_otp(phone, code)
            
        if is_valid:
            # Check if user exists, if not create one
            if email:
                cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            else:
                cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
                
            user = cursor.fetchone()
            
            if not user:
                if email:
                    cursor.execute(
                        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                        (email, "otp_login", email.split('@')[0])
                    )
                else:
                    cursor.execute(
                        "INSERT INTO users (phone, password, name) VALUES (?, ?, ?)",
                        (phone, "otp_login", f"User_{phone[-4:]}")
                    )
                conn.commit()
                
                if email:
                    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                else:
                    cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
                user = cursor.fetchone()
            
            # Delete used OTP from local DB if it was email
            if email:
                cursor.execute("DELETE FROM otps WHERE email = ?", (email,))
                conn.commit()
                
            # Log session to Cosmos DB (Anonymized)
            session_id = str(uuid.uuid4())
            cosmos_item = {
                "id": session_id,
                "user_identifier": email if email else f"phone_{phone[-4:]}",
                "login_time": datetime.utcnow().isoformat(),
                "auth_type": "otp",
                "is_pii_scrubbed": True
            }
            cosmos_service.save_item(CONTAINER_SESSIONS, cosmos_item)

            return user
        return None
    except Exception as e:
        print(f"OTP verification error: {e}")
        return None
    finally:
        conn.close()

def register_user(email, password, name=None, phone=None):
    conn = get_db()
    cursor = conn.cursor()
    
    # Normalize email
    email = email.lower().strip() if email else None
    phone = phone.strip() if phone else None

    try:
        cursor.execute(
            "INSERT INTO users (email, phone, password, name) VALUES (?, ?, ?, ?)",
            (email, phone, password, name)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    except Exception as e:
        print(f"Registration error: {e}")
        return False
    finally:
        conn.close()

def login_user(email, password):
    conn = get_db()
    cursor = conn.cursor()
    
    # Normalize email
    email = email.lower().strip()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password)
    )
    user = cursor.fetchone()
    conn.close()
    return user
