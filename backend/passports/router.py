from fastapi import APIRouter
from .schemas import PassportGenerateRequest, PassportGenerateResponse
from .service import generate_passport

router = APIRouter(prefix="/passports", tags=["passports"])

@router.post("/generate", response_model=PassportGenerateResponse)
def route_generate_passport(req: PassportGenerateRequest) -> PassportGenerateResponse:
    return generate_passport(req)
