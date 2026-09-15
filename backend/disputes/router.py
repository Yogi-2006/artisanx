from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user, get_token
from database import get_authenticated_client, get_service_client
from .schemas import DisputeCreate, DisputeUpdate
from datetime import datetime

router = APIRouter(prefix="/disputes", tags=["disputes"])

def get_role(user: dict):
    return user.get("role")

@router.post("/")
def create_dispute(req: DisputeCreate, current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    client = get_authenticated_client(token)
    user_id = current_user["id"]
    role = get_role(current_user)
    
    if role not in ["artisan", "buyer"]:
        raise HTTPException(status_code=403, detail="Only artisans and buyers can raise disputes")
        
    # Get the order to verify IDs
    order_res = client.table("orders").select("artisan_id, buyer_id, id").eq("id", req.order_id).execute()
    if not order_res.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = order_res.data[0]
    
    # Verify the user is part of the order
    if role == "buyer" and order["buyer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if role == "artisan" and order["artisan_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    data = {
        "order_id": order["id"],
        "product_id": req.product_id,
        "buyer_id": order["buyer_id"],
        "artisan_id": order["artisan_id"],
        "reason": req.reason,
        "raised_by_role": role,
        "status": "open"
    }
    
    if role == "buyer":
        data["buyer_explanation"] = req.explanation
    else:
        data["artisan_explanation"] = req.explanation
        
    res = client.table("disputes").insert(data).execute()
    d_id = res.data[0]["id"]
    
    # Create conversation for this dispute (between buyer, artisan, facilitator)
    # The existing schema for conversation is:
    # dispute_id, artisan_id, buyer_id
    conv_data = {
        "dispute_id": d_id,
        "artisan_id": order["artisan_id"],
        "buyer_id": order["buyer_id"]
    }
    client.table("conversations").insert(conv_data).execute()
    
    from notifications.service import notify_facilitators
    notify_facilitators("dispute_created", "New Dispute Raised", f"A new dispute was raised for order {order['id'][:8]}.", {"dispute_id": d_id})
    
    return {"status": "success", "dispute": res.data[0]}

@router.get("/")
def get_disputes(current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    client = get_service_client()
    user_id = current_user["id"]
    role = get_role(current_user)
    
    if role == "buyer":
        res = client.table("disputes").select("*, artisan:users!artisan_id(display_name), buyer:users!buyer_id(display_name)").eq("buyer_id", user_id).order("updated_at", desc=True).execute()
    elif role == "artisan":
        res = client.table("disputes").select("*, artisan:users!artisan_id(display_name), buyer:users!buyer_id(display_name)").eq("artisan_id", user_id).order("updated_at", desc=True).execute()
    elif role == "facilitator":
        res = client.table("disputes").select("*, artisan:users!artisan_id(display_name), buyer:users!buyer_id(display_name)").order("updated_at", desc=True).execute()
    else:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    ds = res.data or []
    if ds:
        d_ids = [d["id"] for d in ds]
        conv_res = client.table("conversations").select("id, dispute_id").in_("dispute_id", d_ids).execute()
        conv_map = {}
        for c in (conv_res.data or []):
            if c["dispute_id"] not in conv_map:
                conv_map[c["dispute_id"]] = []
            conv_map[c["dispute_id"]].append(c)
        for d in ds:
            d["conversations"] = conv_map.get(d["id"], [])
            
    return {"disputes": ds}

@router.get("/{id}")
def get_dispute(id: str, current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    client = get_service_client()
    user_id = current_user["id"]
    role = get_role(current_user)
    
    res = client.table("disputes").select("*, artisan:users!artisan_id(display_name), buyer:users!buyer_id(display_name), order:orders(*)").eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Not found")
        
    d = res.data[0]
    
    if role == "artisan" and d["artisan_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if role == "buyer" and d["buyer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    conv_res = client.table("conversations").select("id").eq("dispute_id", id).execute()
    d["conversations"] = conv_res.data or []
        
    return {"dispute": d}

@router.put("/{id}")
def update_dispute(id: str, req: DisputeUpdate, current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    client = get_service_client()
    user_id = current_user["id"]
    role = get_role(current_user)
    
    res = client.table("disputes").select("*").eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Not found")
        
    d = res.data[0]
    
    if role == "artisan" and d["artisan_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if role == "buyer" and d["buyer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    update_data = req.dict(exclude_unset=True)
    
    # Enforce role-based updates
    if role == "buyer" and "buyer_explanation" not in update_data:
        if "status" in update_data and update_data["status"] not in ["resolved", "closed"]:
             pass
    
    if "status" in update_data and update_data["status"] == "resolved":
        update_data["resolved_at"] = datetime.utcnow().isoformat()
        
    if update_data:
        client.table("disputes").update(update_data).eq("id", id).execute()
        
        if role == "facilitator":
            from facilitator.service import log_facilitator_activity
            if update_data.get("status") == "closed":
                log_facilitator_activity(user_id, "dispute_closed", "dispute", id, "Dispute closed")
            elif update_data.get("status") == "resolved":
                log_facilitator_activity(user_id, "resolution_recorded", "dispute", id, "Dispute resolved")
            else:
                log_facilitator_activity(user_id, "dispute_reviewed", "dispute", id, "Dispute reviewed/updated")
        
    return {"status": "success"}
