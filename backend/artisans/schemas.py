from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ArtisanProfileCreate(BaseModel):
    artisan_name: str
    business_name: Optional[str] = None
    craft_type: str
    craft_category: str
    location: str
    cooperative_name: Optional[str] = None
    craft_story: Optional[str] = None
    years_experience: Optional[int] = None
    production_capacity: Optional[str] = None

class ArtisanProfileUpdate(BaseModel):
    artisan_name: Optional[str] = None
    business_name: Optional[str] = None
    craft_type: Optional[str] = None
    craft_category: Optional[str] = None
    location: Optional[str] = None
    cooperative_name: Optional[str] = None
    craft_story: Optional[str] = None
    years_experience: Optional[int] = None
    production_capacity: Optional[str] = None

class ArtisanProfileResponse(BaseModel):
    id: str
    user_id: str
    artisan_name: str
    business_name: Optional[str] = None
    craft_type: str
    craft_category: str
    location: str
    cooperative_name: Optional[str] = None
    craft_story: Optional[str] = None
    years_experience: Optional[int] = None
    production_capacity: Optional[str] = None
    profile_photo_url: Optional[str] = None
    verification_status: Optional[str] = None
    created_at: Optional[datetime] = None
