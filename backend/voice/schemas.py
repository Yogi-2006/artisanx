from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VoiceRecordResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    user_id: str
    audio_url: str
    duration_seconds: Optional[int] = None
    created_at: Optional[datetime] = None

class TranscriptResponse(BaseModel):
    id: str
    voice_record_id: str
    original_text: str
    translated_text: str
    original_language: str
    translated_language: str
