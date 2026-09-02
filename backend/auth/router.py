from fastapi import APIRouter
from .service import send_otp, verify_otp, get_me

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/send-otp")
def route_send_otp(phone: str) -> dict:
    return send_otp(phone)

@router.post("/verify-otp")
def route_verify_otp(phone: str, otp: str) -> dict:
    return verify_otp(phone, otp)

@router.get("/me")
def route_get_me() -> dict:
    return get_me()
