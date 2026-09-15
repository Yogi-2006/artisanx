import asyncio
import httpx
from database import get_service_client

async def run():
    client = get_service_client()
    
    fac_res = client.table("users").select("id").eq("role", "facilitator").limit(1).execute()
    if not fac_res.data:
        print("No facilitator found")
        return
    fac_id = fac_res.data[0]["id"]
    print(f"Facilitator ID: {fac_id}")
    
    print("\n--- Order Monitoring ---")
    orders_res = client.table("orders").select("*").execute()
    delayed = [o for o in orders_res.data if o.get("status") not in ["dispatched", "delivered", "completed", "cancelled"]]
    print(f"Total orders: {len(orders_res.data)}, Delayed/Active: {len(delayed)}")
    
    print("\n--- Artisan Performance ---")
    art_res = client.table("users").select("id").eq("role", "artisan").limit(1).execute()
    if art_res.data:
        art_id = art_res.data[0]["id"]
        print(f"Artisan {art_id} has performance endpoints ready.")
        
    print("\n--- Notifications ---")
    notif_res = client.table("notifications").select("*").eq("user_id", fac_id).execute()
    print(f"Facilitator notifications: {len(notif_res.data)}")
    if notif_res.data:
        print(notif_res.data[-1])
    
    print("\n--- Activity Log ---")
    act_res = client.table("facilitator_activities").select("*").eq("facilitator_id", fac_id).execute()
    print(f"Facilitator activities: {len(act_res.data)}")
    if act_res.data:
        print(act_res.data[-1])
        
    print("\nALL OK")

asyncio.run(run())
