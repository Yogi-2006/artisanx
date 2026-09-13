from fastapi import HTTPException
from database import get_supabase_client

def send_otp(phone: str):
    try:
        client = get_supabase_client()
        response = client.auth.sign_in_with_otp({"phone": phone})
        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def verify_otp(phone: str, token: str):
    try:
        client = get_supabase_client()
        response = client.auth.verify_otp({"phone": phone, "token": token, "type": "sms"})
        if not response.user:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        user_record = get_or_create_user(client, response.user)
        return {"access_token": response.session.access_token, "refresh_token": response.session.refresh_token, "user": user_record}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def register_email(email: str, password: str):
    try:
        client = get_supabase_client()
        response = client.auth.sign_up({"email": email, "password": password})
        if not response.user:
            raise HTTPException(status_code=400, detail="Registration failed")
        
        user_record = {
            "id": response.user.id,
            "email": response.user.email,
            "phone": response.user.phone,
            "role": None
        }
        return {
            "message": "Registration successful", 
            "user": user_record,
            "access_token": response.session.access_token if response.session else None,
            "refresh_token": response.session.refresh_token if response.session else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def login_email(email: str, password: str):
    try:
        client = get_supabase_client()
        response = client.auth.sign_in_with_password({"email": email, "password": password})
        if not response.user:
            raise HTTPException(status_code=400, detail="Login failed")
        
        user_record = get_or_create_user(client, response.user)
        return {"access_token": response.session.access_token, "refresh_token": response.session.refresh_token, "user": user_record}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_or_create_user(client, supabase_user):
    user_id = supabase_user.id
    phone = supabase_user.phone
    email = supabase_user.email

    res = client.table("users").select("*").eq("id", user_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    
    new_user = {
        "id": user_id
    }
    if phone:
        new_user["phone"] = phone
    if email:
        new_user["email"] = email

    insert_res = client.table("users").insert(new_user).execute()
    if insert_res.data and len(insert_res.data) > 0:
        return insert_res.data[0]
    return new_user

def set_user_role(user_id: str, role: str, token: str):
    if role not in ["artisan", "buyer", "facilitator"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    client = get_supabase_client()
    client.postgrest.auth(token)
    res = client.table("users").update({"role": role}).eq("id", user_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise HTTPException(status_code=400, detail="Failed to update role")

def refresh_session(refresh_token: str):
    try:
        client = get_supabase_client()
        response = client.auth.refresh_session(refresh_token)
        if not response.session:
            raise HTTPException(status_code=401, detail="Refresh failed")
        
        user_record = get_or_create_user(client, response.user)
        return {"access_token": response.session.access_token, "refresh_token": response.session.refresh_token, "user": user_record}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
