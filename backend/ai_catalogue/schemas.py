from pydantic import BaseModel
from typing import Optional, List

class CatalogueGenerateRequest(BaseModel):
    transcript: str
    category: Optional[str] = None
    language: Optional[str] = "en"

class CatalogueGenerateResponse(BaseModel):
    title: str
    description: str
    category: str
    tags: List[str]
    materials: List[str]
    care_instructions: str
    estimated_production_time: str
    dimensions: Optional[str] = None

class CatalogueSaveRequest(CatalogueGenerateResponse):
    pass
