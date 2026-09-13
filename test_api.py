from fastapi.testclient import TestClient
import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from main import app
from database import get_service_client

client = TestClient(app)

def main():
    service_client = get_service_client()
    
    auth_res = service_client.auth.sign_in_with_password({
        "email": "test@artisanx.com",
        "password": "password"
    })
    
    token = auth_res.session.access_token
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Exact payload from frontend productStore.ts fetchMarketData
    payload = {
        "material_costs": [],
        "hidden_costs": [],
        "labor_hours": 0,
        "labor_rate": 0,
        "packaging_cost": 0,
        "overhead_cost": 0,
        "logistics_cost": 0,
        "profit_margin_percent": 20,
        "category": "Wooden Bowl",
        "materials": ["Teak", "Wood"]
    }
    
    response = client.post("/pricing/calculate", json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(response.json())

if __name__ == '__main__':
    main()
