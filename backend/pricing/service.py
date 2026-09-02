from .schemas import PricingCalculateRequest, PricingCalculateResponse

def calculate_price(req: PricingCalculateRequest) -> PricingCalculateResponse:
    return PricingCalculateResponse(calculated_min_price=10.0, calculated_suggested_price=15.0)
