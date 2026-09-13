import logging
from typing import Optional, Dict, Any, List
from database import get_service_client, get_authenticated_client

logger = logging.getLogger(__name__)

def create_notification(user_id: str, type: str, title: str, message: str, metadata: Optional[Dict[str, Any]] = None):
    try:
        service_client = get_service_client()
        notif_data = {
            "user_id": user_id,
            "type": type,
            "title": title,
            "message": message,
            "metadata": metadata or {}
        }
        res = service_client.table("notifications").insert(notif_data).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"Failed to create notification for user {user_id}")
        # Do not throw to preserve failure isolation
        return None

def get_notifications(token: str) -> List[Dict]:
    client = get_authenticated_client(token)
    res = client.table("notifications").select("*").order("created_at", desc=True).execute()
    return res.data

def get_unread_count(token: str) -> int:
    client = get_authenticated_client(token)
    res = client.table("notifications").select("id", count="exact").eq("is_read", False).execute()
    return res.count if res.count is not None else 0

def mark_as_read(notif_id: str, token: str) -> bool:
    client = get_authenticated_client(token)
    # The RLS policy naturally restricts this to the owner
    res = client.table("notifications").update({"is_read": True}).eq("id", notif_id).execute()
    return len(res.data) > 0 if res.data else False

def mark_all_as_read(token: str) -> bool:
    client = get_authenticated_client(token)
    res = client.table("notifications").update({"is_read": True}).eq("is_read", False).execute()
    return True
