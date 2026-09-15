from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EnquiryCreate(BaseModel):
    product_id: str
    quantity: int
    budget: Optional[float] = None
    delivery_deadline: Optional[datetime] = None
    customisation_request: Optional[str] = None
    buyer_message: Optional[str] = None
    requested_variant: Optional[dict] = None

class EnquiryRespond(BaseModel):
    artisan_response: str
    artisan_response_note: Optional[str] = None
