from pydantic import BaseModel
from typing import Optional, Literal
from typing import Literal

class ArtisanProfileCreate(BaseModel):
    artisan_name: str
    business_name: Optional[str] = None
    craft_type: Optional[str] = None
    craft_category: Optional[str] = None
    location: Optional[str] = None
    cooperative_name: Optional[str] = None
    preferred_language: Optional[Literal['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur']] = 'en'
