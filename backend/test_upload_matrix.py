    # Removed emojis for Windows console compatibility
import httpx
import os
import uuid
import sys
from dotenv import load_dotenv

load_dotenv(".env")

async def test_upload_matrix():
    print("\n--- STARTING VERIFICATION MATRIX ---")
    
    async with httpx.AsyncClient() as client:
        # A. Create User 1
        user1_email = f"user1_{uuid.uuid4().hex[:8]}@example.com"
        password = "password123"
        print(f"\n[Registering User 1: {user1_email}]")
        
        await client.post("http://localhost:8000/auth/register", json={"email": user1_email, "password": password})
        login1 = await client.post("http://localhost:8000/auth/login", json={"email": user1_email, "password": password})
        token1 = login1.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        await client.post("http://localhost:8000/auth/set-role", json={"role": "artisan"}, headers=headers1)
        print("User 1 authenticated as artisan.")
        
        # B & C. Create Draft Product
        print("\n[Test A, B, C: Create Draft Product]")
        prod_res = await client.post("http://localhost:8000/products/", json={
            "title": "Draft Test", "description": "", "category": "", "tags": [],
            "materials": {"list": [], "pricing": {}}, "price": 0, "status": "draft"
        }, headers=headers1)
        
        if prod_res.status_code != 200:
            print("❌ Create Product Failed:", prod_res.text)
            sys.exit(1)
            
        product_id = prod_res.json()["id"]
        print(f"✅ Success. Created Draft Product ID: {product_id}")
        
        # D & E. Upload First Image
        print(f"\n[Test D, E: Upload First Image to {product_id}]")
        with open("test_img.jpg", "wb") as f:
            f.write(b"fake image content")
            
        def get_files():
            return {"file": ("test_img.jpg", open("test_img.jpg", "rb"), "image/jpeg")}
            
        upload1_res = await client.post("http://localhost:8000/images/upload", files=get_files(), data={"product_id": product_id}, headers=headers1)
        
        if upload1_res.status_code != 200:
            print("❌ Upload 1 Failed:", upload1_res.text)
            sys.exit(1)
            
        img1_id = upload1_res.json()["id"]
        img1_url = upload1_res.json()["image_url"]
        print(f"✅ Success. Uploaded image ID: {img1_id}")
        print(f"URL: {img1_url}")
        
        # F. Upload Second Image (Reusing same product_id)
        print("\n[Test F: Upload Second Image]")
        upload2_res = await client.post("http://localhost:8000/images/upload", files=get_files(), data={"product_id": product_id}, headers=headers1)
        if upload2_res.status_code != 200:
            print("❌ Upload 2 Failed:", upload2_res.text)
            sys.exit(1)
        img2_id = upload2_res.json()["id"]
        print(f"✅ Success. Uploaded second image ID: {img2_id}")
        
        # G. Cross-User RLS Test
        print("\n[Test G: Cross-User RLS Test]")
        user2_email = f"user2_{uuid.uuid4().hex[:8]}@example.com"
        await client.post("http://localhost:8000/auth/register", json={"email": user2_email, "password": password})
        login2 = await client.post("http://localhost:8000/auth/login", json={"email": user2_email, "password": password})
        token2 = login2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        await client.post("http://localhost:8000/auth/set-role", json={"role": "artisan"}, headers=headers2)
        
        print("Attempting to delete User 1's image using User 2's token...")
        del_res = await client.delete(f"http://localhost:8000/images/{img1_id}", headers=headers2)
        if del_res.status_code == 404 or del_res.status_code == 403:
            print(f"✅ Success. RLS Blocked User 2. (Status: {del_res.status_code}, Msg: {del_res.json()})")
        else:
            print(f"❌ Failed! User 2 was able to access User 1's image. Status: {del_res.status_code}")
            sys.exit(1)
            
        print("Attempting to update User 1's product using User 2's token...")
        update_res = await client.put(f"http://localhost:8000/products/{product_id}", json={"title": "Hacked"}, headers=headers2)
        if update_res.status_code == 404 or update_res.status_code == 403:
            print(f"✅ Success. RLS Blocked User 2 product update. (Status: {update_res.status_code})")
        else:
            print("❌ Failed! User 2 updated product.")
            sys.exit(1)

        print("\n✅ ALL MATRIX TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(test_upload_matrix())
