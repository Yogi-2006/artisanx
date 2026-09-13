import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from database import get_service_client

client = get_service_client()

workflows = client.table("guidance_workflows").select("*").execute()
print("Workflows:", workflows.data)

steps = client.table("guidance_steps").select("*").execute()
print("Steps:", len(steps.data))

progress = client.table("user_guidance_progress").select("*").execute()
print("Progress:", progress.data)
