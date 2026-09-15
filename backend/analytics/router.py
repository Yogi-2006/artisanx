from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user, get_token, security
from database import get_authenticated_client
from .schemas import TrackEventReq
from datetime import datetime, timedelta
import traceback

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/track")
def track_event(req: TrackEventReq, token: str = Depends(security)):
    # Using raw token to get client since buyer might not be logged in fully for public passport views
    # but we will try to resolve the user if possible
    try:
        from auth.dependencies import verify_token
        user = verify_token(token.credentials)
        client = get_authenticated_client(token.credentials)
        buyer_id = user.get("id")
    except:
        buyer_id = None
        
    data = {
        "product_id": req.product_id,
        "event_type": req.event_type,
        "metadata": req.metadata,
        "buyer_id": buyer_id
    }
    from database import get_service_client
    svc_client = get_service_client()
    svc_client.table("product_analytics_events").insert(data).execute()
    return {"status": "success"}

@router.get("/artisan/performance")
def get_artisan_performance(current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    try:
        from database import get_service_client
        client = get_service_client()
        if current_user.get("role") != "artisan":
            raise HTTPException(status_code=403, detail="Forbidden")
        
        artisan_id = current_user["id"]
    
    # We will compute:
    # 1. Total views / passport views
    # 2. Most viewed products
    # 3. Most enquired products
    # 4. Conversion rate (orders / views)
    
    # Since we can't do complex joins easily in Supabase REST, we'll fetch events and products and aggregate
        prod_res = client.table("products").select("id, title, status").eq("artisan_id", artisan_id).execute()
        products = {p["id"]: p for p in (prod_res.data or [])}
        product_ids = list(products.keys())
    
        if not product_ids:
            return {"total_views": 0, "total_enquiries": 0, "total_orders": 0, "top_products": []}
        
    # Fetch events for these products
        events_res = client.table("product_analytics_events").select("*").in_("product_id", product_ids).execute()
        events = events_res.data or []
    
        total_views = 0
        total_passport_views = 0
        total_saves = 0
    
        prod_stats = {pid: {"title": products[pid]["title"], "views": 0, "enquiries": 0, "orders": 0} for pid in product_ids}
    
        for e in events:
            pid = e["product_id"]
            if pid not in prod_stats: continue
        
            if e["event_type"] == "view":
                total_views += 1
                prod_stats[pid]["views"] += 1
            elif e["event_type"] == "passport_view":
                total_passport_views += 1
                prod_stats[pid]["views"] += 1 # Count passport views as views too
            elif e["event_type"] == "save":
                total_saves += 1
            
    # Fetch enquiries and orders for accurate counts (not relying solely on frontend events)
        enq_res = client.table("buyer_enquiries").select("product_id").in_("product_id", product_ids).execute()
        enquiries = enq_res.data or []
        for enq in enquiries:
            if enq["product_id"] in prod_stats:
                prod_stats[enq["product_id"]]["enquiries"] += 1
            
        ord_res = client.table("orders").select("product_id").in_("product_id", product_ids).execute()
        orders = ord_res.data or []
        for o in orders:
            if o["product_id"] in prod_stats:
                prod_stats[o["product_id"]]["orders"] += 1
            
    # Sort top products by views
        sorted_products = sorted(prod_stats.values(), key=lambda x: x["views"] + x["enquiries"] * 5 + x["orders"] * 10, reverse=True)
    
        return {
            "total_views": total_views,
            "total_passport_views": total_passport_views,
            "total_saves": total_saves,
            "total_enquiries": len(enquiries),
            "total_orders": len(orders),
            "conversion_rate": round(len(orders) / total_views * 100, 1) if total_views > 0 else 0,
            "top_products": sorted_products[:5]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceback": traceback.format_exc()}

