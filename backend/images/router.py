from fastapi import APIRouter
from .schemas import ImageEnhanceRequest
from .service import upload_image, enhance_image

router = APIRouter(prefix="/images", tags=["images"])

@router.post("/upload")
def route_upload_image() -> dict:
    return upload_image()

@router.post("/enhance")
def route_enhance_image(req: ImageEnhanceRequest) -> dict:
    return enhance_image(req)
