import httpx
import sys
import uuid

API_URL = "http://localhost:8000"

def run_test():
    with httpx.Client(follow_redirects=True, timeout=60.0) as client:
        # Register user 1
        print("Registering User 1...")
        res = client.post(f"{API_URL}/auth/register", json={
            "email": f"test{uuid.uuid4().hex[:8]}@example.com",
            "password": "password123",
            "full_name": "Test User 1",
            "phone_number": "+1234567890"
        })
        token1 = res.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Register user 2
        print("Registering User 2...")
        res2 = client.post(f"{API_URL}/auth/register", json={
            "email": f"test{uuid.uuid4().hex[:8]}@example.com",
            "password": "password123",
            "full_name": "Test User 2",
            "phone_number": "+1234567891"
        })
        token2 = res2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # Create Product for User 1
        print("Creating Product...")
        res = client.post(f"{API_URL}/products/", json={
            "title": "Test Product",
            "description": "Test Desc",
            "category": "Pottery"
        }, headers=headers1)
        product_id = res.json()["id"]

        # Voice upload
        print("Voice Upload...")
        with open("test_audio.mp3", "rb") as f:
            files = {"file": ("test_audio.mp3", f, "audio/mpeg")}
            res = client.post(f"{API_URL}/voice/upload", files=files, data={"product_id": product_id}, headers=headers1)
        print("Voice Upload Result:", res.status_code, res.text)
        if res.status_code != 200:
            print("Voice upload failed")
            return
            
        record_id = res.json()["id"]
        
        # Transcribe
        print("Transcribing Voice...")
        res = client.post(f"{API_URL}/voice/transcribe/{record_id}", headers=headers1)
        print("Transcribe Result:", res.status_code, res.text)
        
        # Cross-user security check
        print("Testing Cross-User Security...")
        res = client.post(f"{API_URL}/voice/transcribe/{record_id}", headers=headers2)
        print("Cross-User Result (Should be 403 or 404):", res.status_code, res.text)

run_test()
