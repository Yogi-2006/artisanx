from fastapi import Depends
from typing import Any

def get_current_user() -> Any:
    return {"id": "placeholder_user_id"}
