from fastapi import APIRouter
from .schemas import AICatalogueGenerateRequest, AICatalogueGenerateResponse
from .service import generate_catalogue

router = APIRouter(prefix="/catalogue", tags=["catalogue"])

@router.post("/generate", response_model=AICatalogueGenerateResponse)
def route_generate_catalogue(req: AICatalogueGenerateRequest) -> AICatalogueGenerateResponse:
    return generate_catalogue(req)
