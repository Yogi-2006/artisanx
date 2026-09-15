import requests
from supabase import create_client

url = "https://itcfbaixedvorfbcvajo.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y2ZiYWl4ZWR2b3JmYmN2YWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM1Mjk2NCwiZXhwIjoyMTAzOTI4OTY0fQ.Tl7HnKz7pOg18gjpIfq79RDEP3iIzeClSXuqSNPQ7W0"
client = create_client(url, key)

# Get an artisan
users = client.table("users").select("*").eq("role", "artisan").execute()
if not users.data:
    print("No artisan found.")
    exit()

artisan = users.data[0]
print(f"Testing with artisan: {artisan['display_name']} ({artisan['id']})")

# We don't have the password, but we can bypass it by creating a custom JWT
# actually, let's just use the Supabase admin client to generate a link or just hit the dashboard logic directly?
# Wait, I want to hit the ACTUAL FastAPI backend running on 8000.
# I need a valid JWT token. 
# Since we have the service role key, we can't easily sign a user token unless we know the JWT secret, which is in Supabase dashboard.
# But wait! I can just modify the FastAPI endpoint temporarily to accept an optional "?test_artisan_id=..." and bypass auth, OR just print the error to a file!

# Alternatively, I can just read the FastAPI process stderr if I could? No.
