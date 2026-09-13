from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Any, Optional
from . import schemas
from . import service
from auth.dependencies import get_current_user, get_token

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/upload", response_model=schemas.VoiceRecordResponse)
def route_upload_voice(
    product_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: Any = Depends(get_current_user),
    token: str = Depends(get_token)
):
    return service.upload_audio(file, product_id, current_user["id"], token)

@router.post("/transcribe/{record_id}", response_model=schemas.TranscriptResponse)
def route_transcribe_voice(record_id: str, current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.transcribe_and_translate(record_id, current_user["id"], token)

@router.get("/transcript/{record_id}", response_model=schemas.TranscriptResponse)
def route_get_transcript(record_id: str, current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.get_transcript(record_id, current_user["id"], token)
