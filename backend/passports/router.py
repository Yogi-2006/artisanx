from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials
from auth.dependencies import get_token, security, get_current_user
from database import get_authenticated_client, get_supabase_client
from .schemas import PassportGenerateResponse
from .service import generate_passport, get_passport
import io

router = APIRouter(prefix="/passports", tags=["passports"])

@router.post("/generate/{product_id}", response_model=PassportGenerateResponse)
def route_generate_passport(product_id: str, token: HTTPAuthorizationCredentials = Depends(security), user: dict = Depends(get_current_user)) -> PassportGenerateResponse:
    auth_client = get_authenticated_client(token.credentials)
    return generate_passport(product_id, auth_client, user["id"])

@router.get("/{product_id}")
def route_get_passport(product_id: str) -> dict:
    return get_passport(product_id)

@router.get("/{product_id}/qr")
def route_get_qr_image(product_id: str):
    client = get_supabase_client()
    try:
        res = client.storage.from_("qr-codes").download(f"{product_id}.png")
        return StreamingResponse(io.BytesIO(res), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=404, detail="QR code not found")
