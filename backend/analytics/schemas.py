from pydantic import BaseModel
from typing import Optional

class TrackEventReq(BaseModel):
    product_id: str
    event_type: str
    metadata: Optional[dict] = None
