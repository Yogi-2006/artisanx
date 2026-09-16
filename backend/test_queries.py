from database import get_service_client
import traceback
client = get_service_client()
art_id = "f23c82a0-1413-46c4-9234-90efc28fff19"

queries = [
    ('users', lambda: client.table("users").select("id, display_name, artisan_profiles(craft_category, profile_photo_url, verification_status, craft_story, location)").eq("id", art_id).eq("role", "artisan").execute()),
    ('products', lambda: client.table("products").select("id, title, status, readiness_score, price, product_images(image_url)").eq("artisan_id", art_id).execute()),
    ('orders', lambda: client.table("orders").select("id, status, created_at, buyer:users!buyer_id(display_name)").eq("artisan_id", art_id).eq("status", "completed").execute()),
    ('buyer_reviews', lambda: client.table("buyer_reviews").select("id, rating_overall, review_text, created_at, buyer:users!buyer_id(display_name)").eq("artisan_id", art_id).execute()),
    ('disputes', lambda: client.table("disputes").select("id").eq("artisan_id", art_id).eq("status", "open").execute())
]

for name, q in queries:
    try:
        q()
        print(f"{name}: OK")
    except Exception as e:
        print(f"{name}: ERROR - {str(e)}")
        traceback.print_exc()
