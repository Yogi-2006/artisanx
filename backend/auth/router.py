from fastapi import APIRouter, Depends
from typing import Any
from . import service
from . import schemas
from .dependencies import get_current_user, get_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/send-otp")
def route_send_otp(req: schemas.SendOTPRequest):
    return service.send_otp(req.phone)

@router.post("/verify-otp")
def route_verify_otp(req: schemas.VerifyOTPRequest):
    return service.verify_otp(req.phone, req.otp)

@router.post("/register")
def route_register(req: schemas.EmailAuthRequest):
    return service.register_email(req.email, req.password)

@router.post("/login")
def route_login(req: schemas.EmailAuthRequest):
    return service.login_email(req.email, req.password)

@router.get("/me")
def route_get_me(current_user: Any = Depends(get_current_user)):
    return current_user

@router.post("/set-role")
def route_set_role(req: schemas.SetRoleRequest, current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.set_user_role(current_user["id"], req.role, token)

@router.post("/refresh")
def route_refresh(req: schemas.RefreshTokenRequest):
    return service.refresh_session(req.refresh_token)
