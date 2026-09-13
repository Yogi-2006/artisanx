from database import get_supabase_client
from guidance.workflows import WORKFLOWS

def seed():
    client = get_supabase_client()
    print("Seeding guidance workflows...")
    for workflow in WORKFLOWS:
        wf_data = {
            "id": workflow["id"],
            "workflow_key": workflow["name"],
            "title_en": workflow["description"],
            "target_role": workflow["target_role"],
            "is_active": workflow["is_active"]
        }
        client.table("guidance_workflows").upsert(wf_data, on_conflict="id").execute()
        
        for step in workflow.get("steps", []):
            step_data = {k: v for k, v in step.items()}
            step_data["workflow_id"] = workflow["id"]
            
            existing_step = client.table("guidance_steps").select("id").eq("workflow_id", workflow["id"]).eq("step_order", step["step_order"]).maybe_single().execute()
            if existing_step.data:
                client.table("guidance_steps").update(step_data).eq("id", existing_step.data["id"]).execute()
            else:
                client.table("guidance_steps").insert(step_data).execute()
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
