from fastapi import APIRouter
from .schemas import NotificationResponse
from .service import get_notifications

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=list[NotificationResponse])
def route_get_notifications() -> list[NotificationResponse]:
    return get_notifications()
