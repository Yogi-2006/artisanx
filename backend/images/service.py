from .schemas import ImageEnhanceRequest

def upload_image() -> dict:
    return {"url": "placeholder"}

def enhance_image(req: ImageEnhanceRequest) -> dict:
    return {"enhanced_url": "placeholder"}
