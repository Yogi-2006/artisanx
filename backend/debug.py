from fastapi.testclient import TestClient
from main import app
from auth.dependencies import get_current_user, get_token
import traceback

# Override dependencies to bypass auth for debugging
def override_get_current_user():
    return {"id": "123", "role": "artisan"}

def override_get_token():
    return "fake_token"

app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_token] = override_get_token

client = TestClient(app)

try:
    print("Testing /conversations/")
    response = client.get("/conversations/")
    print(response.status_code)
    print(response.json())
except Exception as e:
    print("Exception in /conversations/:")
    traceback.print_exc()

try:
    print("\nTesting /analytics/artisan/performance")
    response = client.get("/analytics/artisan/performance")
    print(response.status_code)
    print(response.json())
except Exception as e:
    print("Exception in /analytics:")
    traceback.print_exc()
