from pydantic import BaseModel
from typing import List

class AICatalogueGenerateRequest(BaseModel):
    transcript_id: str

class AICatalogueGenerateResponse(BaseModel):
    title: str
    description: str
    category: str
    tags: List[str]
