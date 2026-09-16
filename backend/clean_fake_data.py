import asyncio
from database import get_service_client

async def clean_db():
    client = get_service_client()
    
    # Keep the demo users
    keep_emails = ["artisan@demo.com", "buyer@demo.com", "facilitator@demo.com", "yogi@demo.com"]
    
    print("Fetching users...")
    try:
        users_resp = client.auth.admin.list_users()
        users = getattr(users_resp, 'users', users_resp) if hasattr(users_resp, 'users') else users_resp
        if isinstance(users, list):
            pass
        elif hasattr(users, 'data'):
            users = users.data
        elif hasattr(users_resp, 'user'): # maybe it returns single object somehow?
            users = [users_resp.user]
        
        users_to_delete = [u for u in users if getattr(u, 'email', None) not in keep_emails and (isinstance(u, dict) and u.get('email') not in keep_emails if isinstance(u, dict) else True)]
        
        # Standardize users list if they are objects
        valid_users = []
        for u in users:
            email = getattr(u, 'email', None) or (u.get('email') if isinstance(u, dict) else None)
            id_ = getattr(u, 'id', None) or (u.get('id') if isinstance(u, dict) else None)
            if email not in keep_emails and id_:
                valid_users.append((id_, email))

        print(f"Deleting {len(valid_users)} fake users...")
        for id_, email in valid_users:
            try:
                client.auth.admin.delete_user(id_)
                print(f"Deleted user {email}")
            except Exception as e:
                print(f"Error deleting {email}: {e}")
                
        print("Clean complete.")
    except Exception as ex:
        print("Error:", ex)
        # Fallback: delete from users table directly
        print("Deleting directly from users table...")
        res = client.table("users").select("id, email").execute()
        for u in res.data:
            if u.get('email') not in keep_emails:
                try:
                    client.table("users").delete().eq("id", u['id']).execute()
                    print("Deleted", u['email'])
                except Exception as e:
                    print("Error deleting", u['email'])

asyncio.run(clean_db())
