from fastapi import APIRouter
from .schemas import VoiceTranscriptResponse
from .service import process_voice

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/process", response_model=VoiceTranscriptResponse)
def route_process_voice() -> VoiceTranscriptResponse:
    return process_voice()
