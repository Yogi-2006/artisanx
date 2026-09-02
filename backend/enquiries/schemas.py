from pydantic import BaseModel
from typing import Optional

class EnquiryCreate(BaseModel):
    product_id: str
    quantity: int
