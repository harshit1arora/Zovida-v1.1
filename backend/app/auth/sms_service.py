import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_VERIFY_SERVICE_ID = os.getenv("TWILIO_VERIFY_SERVICE_ID")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

def clean_phone_number(phone_number, for_whatsapp=False):
    """
    Cleans phone number to E.164 format.
    """
    if not phone_number:
        return ""
    cleaned = "".join(char for char in phone_number if char.isdigit() or char == '+')
    if not cleaned.startswith('+'):
        cleaned = '+' + cleaned
    
    if for_whatsapp and not cleaned.startswith('whatsapp:'):
        return f"whatsapp:{cleaned}"
    return cleaned

def request_whatsapp_otp(phone_number):
    """
    Starts a Twilio Verify verification for the given phone number via WhatsApp.
    """
    phone_number = clean_phone_number(phone_number)
    print(f"📱 [VERIFY SERVICE] Requesting WhatsApp OTP for {phone_number}")

    if not TWILIO_ACCOUNT_SID or "your_" in TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or "your_" in TWILIO_AUTH_TOKEN:
        print("⚠️ [VERIFY SERVICE] Twilio credentials not configured. Mocking success.")
        return True

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        verification = client.verify.v2.services(TWILIO_VERIFY_SERVICE_ID) \
            .verifications \
            .create(to=phone_number, channel='whatsapp')
        
        print(f"📧 [VERIFY SERVICE] WhatsApp Verification started. SID: {verification.sid}")
        return True
    except Exception as e:
        print(f"❌ [VERIFY SERVICE] Failed to start WhatsApp verification: {e}")
        return False

def request_phone_otp(phone_number):
    """
    Starts a Twilio Verify verification for the given phone number.
    Returns True if successful, False otherwise.
    """
    phone_number = clean_phone_number(phone_number)
    print(f"📱 [VERIFY SERVICE] Requesting OTP for {phone_number}")

    if not TWILIO_ACCOUNT_SID or "your_" in TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or "your_" in TWILIO_AUTH_TOKEN:
        print("⚠️ [VERIFY SERVICE] Twilio credentials not configured (Auth Token is missing). Mocking success.")
        return True

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        verification = client.verify.v2.services(TWILIO_VERIFY_SERVICE_ID) \
            .verifications \
            .create(to=phone_number, channel='sms')
        
        print(f"📧 [VERIFY SERVICE] Verification started. SID: {verification.sid}")
        return True
    except Exception as e:
        print(f"❌ [VERIFY SERVICE] Failed to start verification: {e}")
        # Log specifically if it's an authentication error
        if "Authenticate" in str(e):
            print("💡 TIP: Your TWILIO_AUTH_TOKEN or TWILIO_ACCOUNT_SID might be incorrect.")
        return False

def check_phone_otp(phone_number, code):
    """
    Checks the Twilio Verify code for the given phone number.
    Returns True if valid, False otherwise.
    """
    phone_number = clean_phone_number(phone_number)
    print(f"📱 [VERIFY SERVICE] Checking OTP for {phone_number}")

    if not TWILIO_ACCOUNT_SID or "your_" in TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or "your_" in TWILIO_AUTH_TOKEN:
        print("⚠️ [VERIFY SERVICE] Twilio credentials not configured. Mocking validation for '123456'.")
        return code == "123456"

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        verification_check = client.verify.v2.services(TWILIO_VERIFY_SERVICE_ID) \
            .verification_checks \
            .create(to=phone_number, code=code)
        
        print(f"📧 [VERIFY SERVICE] Verification status: {verification_check.status}")
        return verification_check.status == 'approved'
    except Exception as e:
        print(f"❌ [VERIFY SERVICE] Failed to check verification: {e}")
        return False
