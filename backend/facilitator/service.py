import logging
from database import get_service_client

logger = logging.getLogger(__name__)

def log_facilitator_activity(facilitator_id: str, action: str, entity_type: str = None, entity_id: str = None, notes: str = None):
    try:
        client = get_service_client()
        data = {
            "facilitator_id": facilitator_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "notes": notes
        }
        client.table("facilitator_activities").insert(data).execute()
    except Exception as e:
        logger.error(f"Failed to log facilitator activity: {str(e)}")
