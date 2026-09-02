from pydantic import BaseModel
from typing import Optional

class PricingCalculateRequest(BaseModel):
    product_id: str

class PricingCalculateResponse(BaseModel):
    calculated_min_price: float
    calculated_suggested_price: float
