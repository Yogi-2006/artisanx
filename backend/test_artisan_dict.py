from database import get_service_client
import traceback
client = get_service_client()
art_id = "f23c82a0-1413-46c4-9234-90efc28fff19"

try:
    res = client.table("users").select("id, display_name, artisan_profiles(craft_category, profile_photo_url, verification_status, craft_story, location)").eq("id", art_id).eq("role", "artisan").execute()
    u = res.data[0]
    print("artisan_profiles type:", type(u.get("artisan_profiles")))
    print("artisan_profiles:", u.get("artisan_profiles"))
    
    # Try the code from the router
    prof = (u.get("artisan_profiles") or [{}])[0] if u.get("artisan_profiles") else {}
    print("prof:", prof)
except Exception as e:
    traceback.print_exc()
