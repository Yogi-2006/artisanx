def send_otp(phone: str) -> dict:
    return {"success": True}

def verify_otp(phone: str, otp: str) -> dict:
    return {"token": "placeholder"}

def get_me() -> dict:
    return {"user": "placeholder"}
