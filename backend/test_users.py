from database import get_service_client
client = get_service_client()
res = client.table("users").select("*").limit(1).execute()
print(res.data)
