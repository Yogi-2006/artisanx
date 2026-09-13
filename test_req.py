import requests
import os

token = ""

res = requests.post(
    "http://127.0.0.1:8000/ai/generate-catalogue",
    json={"transcript": "hello"},
    headers={"Authorization": f"Bearer {token}"}
)
print("Status:", res.status_code)
print("Response:", res.text)
