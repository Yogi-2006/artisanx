import uuid
import os
import tempfile
import httpx
import json
from fastapi import HTTPException, UploadFile
from database import supabase_client, get_authenticated_client
from ai.gemini_client import process_audio_and_generate

ALLOWED_AUDIO_TYPES = ["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4", "audio/ogg"]

def upload_audio(file: UploadFile, product_id: str, artisan_id: str, token: str):
    if file.content_type not in ALLOWED_AUDIO_TYPES and not file.filename.endswith((".webm", ".mp3", ".wav")):
        raise HTTPException(status_code=400, detail="Invalid audio format")
    
    file_content = file.file.read()
    file_ext = file.filename.split(".")[-1] if file.filename else "webm"
    file_name = f"{artisan_id}/{uuid.uuid4().hex}.{file_ext}"
    
    auth_client = get_authenticated_client(token)
    try:
        auth_client.storage.from_("voice-records").upload(
            file_name, 
            file_content,
            {"content-type": file.content_type}
        )
        
        record = {
            "user_id": artisan_id,
            "audio_url": file_name
        }
        if product_id:
            record["product_id"] = product_id
            
        res = auth_client.table("voice_records").insert(record).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
            
        raise HTTPException(status_code=500, detail="Failed to save voice record in DB")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def verify_record_owner(record_id: str, artisan_id: str, token: str):
    auth_client = get_authenticated_client(token)
    res = auth_client.table("voice_records").select("*").eq("id", record_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Voice record not found")
        
    record = res.data[0]
    if record.get("user_id") != artisan_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this voice record")
    return record

def transcribe_and_translate(record_id: str, artisan_id: str, token: str):
    record = verify_record_owner(record_id, artisan_id, token)
    auth_client = get_authenticated_client(token)
    audio_path = record.get("audio_url")
    if not audio_path:
        raise HTTPException(status_code=400, detail="No audio path found")
        
    try:
        audio_bytes = auth_client.storage.from_("voice-records").download(audio_path)
        
        fd, temp_path = tempfile.mkstemp(suffix=".webm")
        with os.fdopen(fd, 'wb') as f:
            f.write(audio_bytes)
            
        prompt = """
        Please listen to this audio recorded by an Indian artisan describing their product.
        Return a JSON response with EXACTLY this structure:
        {
          "detected_language": "supported language code (en/ta/hi/te/kn/ml/bn/mr/ur)",
          "original_text": "verbatim transcript in the original spoken language",
          "english_translation": "natural English translation"
        }
        Keep the translation natural and professional, not word-for-word literal.
        """
        
        result_json = process_audio_and_generate(temp_path, prompt, mime_type="application/json")
        os.remove(temp_path)
        
        try:
            data = json.loads(result_json)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to parse Gemini response")
            
        if "detected_language" not in data or "english_translation" not in data:
            raise HTTPException(status_code=500, detail="Invalid format from Gemini")
            
        transcript_record = {
            "voice_record_id": record_id,
            "original_text": data.get("original_text", ""),
            "translated_text": data["english_translation"],
            "original_language": data["detected_language"],
            "translated_language": "en"
        }
        
        res = auth_client.table("voice_transcripts").insert(transcript_record).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
            
        raise HTTPException(status_code=500, detail="Failed to save transcript to DB")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

def get_transcript(record_id: str, artisan_id: str, token: str):
    auth_client = get_authenticated_client(token)
    verify_record_owner(record_id, artisan_id, token)
    res = auth_client.table("voice_transcripts").select("*").eq("voice_record_id", record_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return res.data[0]
