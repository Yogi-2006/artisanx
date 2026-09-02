from .schemas import VoiceTranscriptResponse

def process_voice() -> VoiceTranscriptResponse:
    return VoiceTranscriptResponse(
        original_text="", original_language="en",
        translated_text="", translated_language="en"
    )
