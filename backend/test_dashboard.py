import os
from supabase import create_client

url = "https://itcfbaixedvorfbcvajo.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y2ZiYWl4ZWR2b3JmYmN2YWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM1Mjk2NCwiZXhwIjoyMTAzOTI4OTY0fQ.Tl7HnKz7pOg18gjpIfq79RDEP3iIzeClSXuqSNPQ7W0"
client = create_client(url, key)

# Let's find an artisan
users = client.table("users").select("id").eq("role", "artisan").execute()
if not users.data:
    print("No artisans found")
    exit()
artisan_id = users.data[0]["id"]
print(f"Testing for artisan: {artisan_id}")

try:
    prod_res = client.table("products").select("status").eq("artisan_id", artisan_id).execute()
    products = prod_res.data or []
    total_products = len(products)
    published_products = sum(1 for p in products if p["status"] == "published")
    print("Products OK")
    
    enq_res = client.table("buyer_enquiries").select("id").eq("artisan_id", artisan_id).eq("status", "new").execute()
    print("Enquiries OK")
    
    quot_res = client.table("quotations").select("id").eq("artisan_id", artisan_id).in_("status", ["draft", "changes_requested"]).execute()
    print("Quotations OK")
    
    ord_res = client.table("orders").select("status, total_order_value").eq("artisan_id", artisan_id).execute()
    orders = ord_res.data or []
    
    active_orders = sum(1 for o in orders if o["status"] not in ["completed", "cancelled", "returned"])
    completed_orders = sum(1 for o in orders if o["status"] == "completed")
    cancelled_orders = sum(1 for o in orders if o["status"] == "cancelled")
    
    total_order_value = sum(float(o.get("total_order_value", 0)) for o in orders if o["status"] not in ["cancelled", "return_requested", "returned", "disputed"])
    print("Orders OK")
    
    order_res = client.table("orders").select("id, display_id").eq("artisan_id", artisan_id).execute()
    orders_data = order_res.data or []
    order_map = {o["id"]: o for o in orders_data}
    order_ids = list(order_map.keys())
    
    recent_activity = []
    if order_ids:
        hist_res = client.table("order_status_history").select("*").in_("order_id", order_ids).order("created_at", desc=True).limit(5).execute()
        for activity in (hist_res.data or []):
            activity["orders"] = order_map.get(activity["order_id"], {})
            recent_activity.append(activity)
            
    print("History OK")
    print("ALL OK")
    
except Exception as e:
    import traceback
    print("EXCEPTION:")
    print(traceback.format_exc())
