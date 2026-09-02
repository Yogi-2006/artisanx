from fastapi import APIRouter
from .schemas import PricingCalculateRequest, PricingCalculateResponse
from .service import calculate_price

router = APIRouter(prefix="/pricing", tags=["pricing"])

@router.post("/calculate", response_model=PricingCalculateResponse)
def route_calculate_price(req: PricingCalculateRequest) -> PricingCalculateResponse:
    return calculate_price(req)
