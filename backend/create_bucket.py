import os
from fastapi import UploadFile
import io
import asyncio
from voice.service import process_voice_directly
from database import get_service_client

# Get a valid token
client = get_service_client()
res = client.table("users").select("id").eq("role", "artisan").limit(1).execute()
if not res.data:
    print("No artisan found")
else:
    artisan_id = res.data[0]["id"]
    print(f"Using artisan: {artisan_id}")
    
    # We need a token, but process_voice_directly takes a token.
    # We can patch get_authenticated_client in voice.service or just use service token
    import voice.service
    voice.service.get_authenticated_client = lambda t: client
    
    class MockUploadFile:
        def __init__(self):
            self.filename = "test.webm"
            self.content_type = "audio/webm"
            self.file = io.BytesIO(b"test audio content")
    
    try:
        res = process_voice_directly(MockUploadFile(), None, artisan_id, "mock_token")
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

