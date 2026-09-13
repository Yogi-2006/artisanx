import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import get_supabase_client, get_authenticated_client

def verify():
    client = get_supabase_client()
    
    users = ["artisan@demo.com", "buyer@demo.com", "facilitator@demo.com"]
    tokens = {}
    print("=== 1. public.users ===")
    for email in users:
        try:
            res = client.auth.sign_in_with_password({"email": email, "password": "DemoPassword123!"})
            tokens[email] = res.session.access_token
            
            auth_client = get_authenticated_client(tokens[email])
            u_res = auth_client.table("users").select("id, email, role").eq("id", res.user.id).execute()
            u = u_res.data[0]
            print(f"User: {u['email']}, Role: {u['role']}")
        except Exception as e:
            print(f"Failed for {email}: {e}")
            
    artisan_client = get_authenticated_client(tokens.get("artisan@demo.com"))
    buyer_client = get_authenticated_client(tokens.get("buyer@demo.com"))
    
    print("\n=== 2. artisan_profiles ===")
    res_prof = artisan_client.table("artisan_profiles").select("user_id, artisan_name").eq("artisan_name", "Lakshmi Devi").execute()
    for p in res_prof.data:
        print(f"Name: {p['artisan_name']}, User ID: {p['user_id']}")
        
    print("\n=== 3. products ===")
    res_prod = artisan_client.table("products").select("id, title, status, readiness_score, price").execute()
    print(f"Total seeded products: {len(res_prod.data)}")
    for p in res_prod.data:
        print(f"- {p['title']} | status: {p['status']} | score: {p['readiness_score']} | price: {p['price']}")
        
    print("\n=== 4. product_images ===")
    prod_ids = [p["id"] for p in res_prod.data]
    if prod_ids:
        res_img = artisan_client.table("product_images").select("id").in_("product_id", prod_ids).execute()
        print(f"Image records for seeded products: {len(res_img.data)}")
    else:
        print("Image records for seeded products: 0")
        
    print("\n=== 5. pricing_inputs ===")
    if prod_ids:
        res_price = artisan_client.table("pricing_inputs").select("id").in_("product_id", prod_ids).execute()
        print(f"Pricing records for seeded products: {len(res_price.data)}")
    else:
        print("Pricing records for seeded products: 0")
        
    print("\n=== 6. buyer_enquiries ===")
    res_enq = buyer_client.table("buyer_enquiries").select("id, buyer_id, product_id").execute()
    print(f"Total seeded enquiries (buyer view): {len(res_enq.data)}")
    
if __name__ == "__main__":
    verify()
