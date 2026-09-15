from fastapi.testclient import TestClient
from main import app
from auth.dependencies import get_current_user, get_token
from database import get_service_client
import conversations.router
import analytics.router
import reviews.router

def override_get_current_user():
    return {"id": "2ce346b7-4e24-4418-af64-41c6935930a0", "role": "artisan"}

def override_get_token():
    return "fake_token"

app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_token] = override_get_token

analytics.router.get_authenticated_client = lambda token: get_service_client()

client = TestClient(app)

print("\n--- Testing /analytics/artisan/performance with 2ce346b7-4e24-4418-af64-41c6935930a0 ---")
try:
    response = client.get("/analytics/artisan/performance")
    print("Status:", response.status_code)
    print(response.json())
except Exception as e:
    import traceback
    traceback.print_exc()

