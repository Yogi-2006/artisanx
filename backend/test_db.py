from database import get_service_client
import traceback

client = get_service_client()

try:
    print("Testing conversations table...")
    res = client.table("conversations").select("id").limit(1).execute()
    print("Conversations exists:", res.data)
except Exception as e:
    print("Conversations error:")
    traceback.print_exc()

try:
    print("\nTesting buyer_reviews table...")
    res = client.table("buyer_reviews").select("id").limit(1).execute()
    print("Buyer_reviews exists:", res.data)
except Exception as e:
    print("Buyer_reviews error:")
    traceback.print_exc()

try:
    print("\nTesting product_analytics_events table...")
    res = client.table("product_analytics_events").select("id").limit(1).execute()
    print("Product_analytics_events exists:", res.data)
except Exception as e:
    print("Product_analytics_events error:")
    traceback.print_exc()
