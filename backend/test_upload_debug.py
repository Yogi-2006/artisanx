import asyncio
import httpx
import os
import uuid
from dotenv import load_dotenv

load_dotenv(".env")

async def test_upload():
    async with httpx.AsyncClient() as client:
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        password = "password123"
        print(f"1. Registering {test_email}...")
        
        # 1. Register
        reg_res = await client.post("http://localhost:8000/auth/register", json={
            "email": test_email,
            "password": password
        })
        if reg_res.status_code != 200:
            print("Register failed:", reg_res.text)
            return
            
        print("2. Logging in...")
        login_res = await client.post("http://localhost:8000/auth/login", json={
            "email": test_email,
            "password": password
        })
        if login_res.status_code != 200:
            print("Login failed:", login_res.text)
            return
            
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("3. Setting role to artisan...")
        role_res = await client.post("http://localhost:8000/auth/set-role", json={"role": "artisan"}, headers=headers)
        if role_res.status_code != 200:
            print("Set role failed:", role_res.text)
            return
        
        print("4. Creating Draft Product...")
        prod_res = await client.post("http://localhost:8000/products/", json={
            "title": "Draft Test",
            "description": "",
            "category": "",
            "tags": [],
            "materials": {"list": [], "pricing": {}},
            "price": 0,
            "status": "draft"
        }, headers=headers)
        
        if prod_res.status_code != 200:
            print("Create Product Failed:", prod_res.text)
            return
            
        product_id = prod_res.json()["id"]
        print(f"Created Draft Product: {product_id}")
        
        print("5. Uploading Image...")
        with open("test_img.jpg", "wb") as f:
            f.write(b"fake image content")
            
        with open("test_img.jpg", "rb") as f:
            files = {"file": ("test_img.jpg", f, "image/jpeg")}
            data = {"product_id": product_id}
            
            upload_res = await client.post("http://localhost:8000/images/upload", files=files, data=data, headers=headers)
            print("Upload Status:", upload_res.status_code)
            print("Upload Body:", upload_res.text)

if __name__ == "__main__":
    asyncio.run(test_upload())
