from pydantic import BaseModel

class ImageEnhanceRequest(BaseModel):
    image_url: str
