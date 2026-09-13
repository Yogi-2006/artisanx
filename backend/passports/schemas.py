from pydantic import BaseModel
from typing import List, Optional, Any

class ProductImage(BaseModel):
    image_url: str
    is_main: bool = False

class PassportData(BaseModel):
    title: str
    images: List[ProductImage]
    artisan_name: str
    artisan_story: Optional[str] = None
    craft_location: Optional[str] = None
    materials: Any = None
    care_instructions: Optional[str] = None
    price: float
    moq: Optional[int] = None
    lead_time: Optional[int] = None
    stock: Optional[int] = None
    customisation_available: bool = False
    verification_status: Optional[str] = None

class PassportGenerateResponse(BaseModel):
    passport_data: PassportData
    qr_code_url: str
    shareable_url: str
