from pydantic import BaseModel
from typing import Optional

class ReviewSubmitRequest(BaseModel):
    review_status: str
    notes: Optional[str] = None
