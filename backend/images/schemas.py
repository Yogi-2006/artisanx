from pydantic import BaseModel
from typing import Optional, List

class ImageUploadResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    image_url: str
    original_url: Optional[str] = None
    enhanced_url: Optional[str] = None
    quality_score: Optional[float] = None
    is_main: bool = False
    enhanced_quality: bool = False
    enhanced_quality_score: Optional[float] = None

class ImageQualityCheck(BaseModel):
    blur_score: float
    brightness_score: float
    contrast_score: float
    overall_score: float
    suggestions: List[str]
