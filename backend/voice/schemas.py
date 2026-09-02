from pydantic import BaseModel
from typing import Literal

class VoiceTranscriptResponse(BaseModel):
    original_text: str
    original_language: Literal['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur']
    translated_text: str
    translated_language: Literal['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur']
