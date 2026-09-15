from pydantic import BaseModel
from typing import Optional

class DisputeCreate(BaseModel):
    order_id: str
    product_id: str
    reason: str
    explanation: str

class DisputeUpdate(BaseModel):
    status: Optional[str] = None
    buyer_explanation: Optional[str] = None
    artisan_explanation: Optional[str] = None
    facilitator_notes: Optional[str] = None
    resolution_summary: Optional[str] = None
