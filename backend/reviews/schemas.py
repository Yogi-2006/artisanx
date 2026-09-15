from pydantic import BaseModel
from typing import Optional

class ReviewCreate(BaseModel):
    order_id: str
    rating_overall: int
    rating_quality: int
    rating_communication: int
    rating_timeliness: int
    review_text: Optional[str] = None
