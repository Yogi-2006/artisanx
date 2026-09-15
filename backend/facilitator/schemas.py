from pydantic import BaseModel
from typing import Optional, List

class ReviewSubmitRequest(BaseModel):
    review_status: str
    notes: Optional[str] = None
    flags: Optional[List[str]] = None

class VerificationUpdateRequest(BaseModel):
    status: str

class SupportStatusUpdateRequest(BaseModel):
    status: str

class DisputeActionRequest(BaseModel):
    action: str
    notes: Optional[str] = None
