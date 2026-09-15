from database import get_service_client
client = get_service_client()
res = client.table("buyer_enquiries").select("*").limit(1).execute()
if res.data:
    print(res.data[0].keys())
else:
    print("No data, try another way")
