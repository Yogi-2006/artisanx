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
            "phone_number": f"+123{uuid.uuid4().hex[:7]}"
        })
        token1 = res.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Register user 2
        print("Registering User 2...")
        res2 = client.post(f"{API_URL}/auth/register", json={
            "email": f"test{uuid.uuid4().hex[:8]}@example.com",
            "password": "password123",
            "full_name": "Test User 2",
            "phone_number": f"+123{uuid.uuid4().hex[:7]}"
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
        with open("test_fresh.mp3", "rb") as f:
            files = {"file": ("test_fresh.mp3", f, "audio/mpeg")}
            response = client.post(
                f"{API_URL}/voice/upload",
                headers={"Authorization": f"Bearer {token1}"},
                data={"product_id": product_id},
                files=files
            )
        
        print(f"Voice Upload Result: {response.status_code} {response.text}")
        if response.status_code != 200:
            return
            
        record_id = response.json()["id"]
        
        # 4. Transcribe Voice
        print("Transcribing Voice...")
        response = client.post(
            f"{API_URL}/voice/transcribe/{record_id}",
            headers={"Authorization": f"Bearer {token1}"}
        )
        print(f"Transcribe Result: {response.status_code} {response.text}")

        # 5. Verify DB record
        print("Querying database to verify voice_transcripts...")
        from database import get_authenticated_client
        supabase = get_authenticated_client(token1)
        db_res = supabase.table("voice_transcripts").select("*").eq("voice_record_id", record_id).execute()
        print("voice_transcripts row:", db_res.data)
        
        # Cross-user security check
        print("Testing Cross-User Security...")
        res = client.post(f"{API_URL}/voice/transcribe/{record_id}", headers=headers2)
        print("Cross-User Result (Should be 403 or 404):", res.status_code, res.text)

run_test()
