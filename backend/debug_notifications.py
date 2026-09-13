import os
import sys
from dotenv import load_dotenv

# Load from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
print(f"SUPABASE_SERVICE_ROLE_KEY PRESENT = {bool(service_key)}")
if not service_key:
    sys.exit(1)

from supabase import create_client, Client

url = os.getenv("SUPABASE_URL")
client: Client = create_client(url, service_key)

print("\n--- TEST SERVICE ROLE PERMISSIONS ---")
try:
    res = client.table("notifications").select("*").limit(1).execute()
    print("notifications table SELECT: SUCCESS")
except Exception as e:
    print(f"notifications table SELECT: FAILED ({e})")

try:
    res = client.table("buyer_enquiries").select("*").limit(1).execute()
    print("buyer_enquiries table SELECT: SUCCESS")
except Exception as e:
    print(f"buyer_enquiries table SELECT: FAILED ({e})")

