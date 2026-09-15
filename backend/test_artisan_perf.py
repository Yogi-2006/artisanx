from database import get_service_client

client = get_service_client()

res = client.table('users').select('*').eq('role', 'artisan').execute()
artisans = res.data or []

for a in artisans:
    artisan_id = a['id']
    print(f"Testing artisan: {artisan_id}")
    
    prod_res = client.table('products').select('id, title, status').eq('artisan_id', artisan_id).execute()
    products = {p['id']: p for p in (prod_res.data or [])}
    product_ids = list(products.keys())
    
    if not product_ids:
        print("  No products")
        continue
        
    print(f"  {len(product_ids)} products")
    try:
        events_res = client.table('product_analytics_events').select('*').in_('product_id', product_ids).execute()
        print("  Events OK")
    except Exception as e:
        print("  Events ERROR:", e)
        
    try:
        enq_res = client.table('buyer_enquiries').select('product_id').in_('product_id', product_ids).execute()
        print("  Enquiries OK")
    except Exception as e:
        print("  Enquiries ERROR:", e)
        
    try:
        ord_res = client.table('orders').select('product_id').in_('product_id', product_ids).execute()
        print("  Orders OK")
    except Exception as e:
        print("  Orders ERROR:", e)

