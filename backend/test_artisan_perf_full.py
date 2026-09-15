from database import get_service_client

client = get_service_client()
res = client.table('users').select('*').eq('role', 'artisan').execute()
artisans = res.data or []

for a in artisans:
    artisan_id = a['id']
    prod_res = client.table('products').select('id, title, status').eq('artisan_id', artisan_id).execute()
    products = {p['id']: p for p in (prod_res.data or [])}
    product_ids = list(products.keys())
    if not product_ids: continue

    events_res = client.table('product_analytics_events').select('*').in_('product_id', product_ids).execute()
    events = events_res.data or []
    
    total_views = 0
    total_passport_views = 0
    total_saves = 0
    
    try:
        prod_stats = {pid: {"title": products[pid]["title"], "views": 0, "enquiries": 0, "orders": 0} for pid in product_ids}
        
        for e in events:
            pid = e["product_id"]
            if pid not in prod_stats: continue
            
            if e["event_type"] == "view":
                total_views += 1
                prod_stats[pid]["views"] += 1
            elif e["event_type"] == "passport_view":
                total_passport_views += 1
                prod_stats[pid]["views"] += 1
            elif e["event_type"] == "save":
                total_saves += 1
                
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
                
        sorted_products = sorted(prod_stats.values(), key=lambda x: x["views"] + x["enquiries"] * 5 + x["orders"] * 10, reverse=True)
        
        result = {
            "total_views": total_views,
            "total_passport_views": total_passport_views,
            "total_saves": total_saves,
            "total_enquiries": len(enquiries),
            "total_orders": len(orders),
            "conversion_rate": round(len(orders) / total_views * 100, 1) if total_views > 0 else 0,
            "top_products": sorted_products[:5]
        }
        print(f"{artisan_id}: OK")
    except Exception as e:
        print(f"{artisan_id}: ERROR - {e}")
