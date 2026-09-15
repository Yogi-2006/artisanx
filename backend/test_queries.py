from fastapi.testclient import TestClient
from main import app
from auth.dependencies import get_current_user, get_token
from database import get_service_client
import conversations.router
import analytics.router
import reviews.router

# Override to bypass auth check
def override_get_current_user():
    return {"id": "cfb04294-f25b-4375-9eef-417772baefbd", "role": "artisan"}

def override_get_token():
    return "fake_token"

app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_token] = override_get_token

# Override database client in each router module namespace!
conversations.router.get_authenticated_client = lambda token: get_service_client()
analytics.router.get_authenticated_client = lambda token: get_service_client()
reviews.router.get_authenticated_client = lambda token: get_service_client()

client = TestClient(app)

print("--- Testing /conversations/ ---")
response = client.get("/conversations/")
print("Status:", response.status_code)
if response.status_code == 500:
    print(response.json())

print("\n--- Testing /analytics/artisan/performance ---")
response = client.get("/analytics/artisan/performance")
print("Status:", response.status_code)
if response.status_code == 500:
    print(response.json())

print("\n--- Testing /reviews/artisan ---")
response = client.get("/reviews/artisan")
print("Status:", response.status_code)
if response.status_code == 500:
    print(response.json())
