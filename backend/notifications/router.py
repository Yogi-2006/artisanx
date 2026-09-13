from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user, get_token
from .schemas import NotificationResponse
from .service import get_notifications, get_unread_count, mark_as_read, mark_all_as_read
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationResponse])
def route_get_notifications(current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    return get_notifications(token)

@router.get("/unread-count")
def route_get_unread_count(current_user: dict = Depends(get_current_user), token: str = Depends(get_token)) -> dict:
    return {"count": get_unread_count(token)}

@router.put("/read-all")
def route_mark_all_as_read(current_user: dict = Depends(get_current_user), token: str = Depends(get_token)) -> dict:
    mark_all_as_read(token)
    return {"status": "success"}

@router.put("/{notif_id}/read")
def route_mark_as_read(notif_id: str, current_user: dict = Depends(get_current_user), token: str = Depends(get_token)) -> dict:
    success = mark_as_read(notif_id, token)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found or unauthorized")
    return {"status": "success"}
