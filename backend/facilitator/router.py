from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from auth.dependencies import security
from database import get_authenticated_client
from .schemas import ReviewSubmitRequest
from datetime import datetime

router = APIRouter(prefix="/facilitator", tags=["facilitator"])

def verify_facilitator(client):
    user_res = client.auth.get_user()
    if not user_res or not user_res.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    db_user = client.table("users").select("role").eq("id", user_res.user.id).execute()
    if not db_user.data or db_user.data[0]["role"] != "facilitator":
        raise HTTPException(status_code=403, detail="Forbidden: Facilitator only")
    return user_res.user.id

@router.get("/stats")
def get_stats(token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    verify_facilitator(client)
    
    artisans_count = client.table("users").select("id", count="exact").eq("role", "artisan").execute().count
    
    art_prof = client.table("artisan_profiles").select("id, profile_photo_url, craft_story").execute()
    incomplete = sum(1 for a in art_prof.data if not a.get("profile_photo_url") or not a.get("craft_story"))
    
    products = client.table("products").select("id, status, price, readiness_score").execute()
    total_products = len(products.data)
    draft_products = sum(1 for p in products.data if p.get("status") == "draft")
    missing_pricing = sum(1 for p in products.data if p.get("price") is None)
    
    readiness_scores = [p.get("readiness_score") for p in products.data if p.get("readiness_score") is not None]
    avg_readiness = sum(readiness_scores) / len(readiness_scores) if readiness_scores else 0
    
    enq_res = client.table("buyer_enquiries").select("id", count="exact").execute()
    total_enquiries = enq_res.count if enq_res.count else 0
    pending_enq = client.table("buyer_enquiries").select("id", count="exact").eq("status", "new").execute().count
    
    return {
        "total_artisans": artisans_count or 0,
        "incomplete_profiles": incomplete,
        "total_products": total_products,
        "draft_products": draft_products,
        "missing_pricing": missing_pricing,
        "avg_readiness": round(avg_readiness),
        "total_enquiries": total_enquiries,
        "pending_enquiries": pending_enq or 0
    }

@router.get("/artisans")
def list_artisans(token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    verify_facilitator(client)
    
    res = client.table("users").select(
        "id, display_name, artisan_profiles(craft_category, profile_photo_url, verification_status), products(id, readiness_score)"
    ).eq("role", "artisan").execute()
    
    artisans = []
    for u in res.data:
        prods = u.get("products") or []
        scores = [p.get("readiness_score") or 0 for p in prods]
        avg = sum(scores)/len(scores) if scores else 0
        
        prof = (u.get("artisan_profiles") or [{}])[0] if u.get("artisan_profiles") else {}
        
        artisans.append({
            "id": u["id"],
            "name": u.get("display_name"),
            "craft": prof.get("craft_category"),
            "photo": prof.get("profile_photo_url"),
            "status": prof.get("verification_status"),
            "product_count": len(prods),
            "avg_readiness": round(avg)
        })
    return {"artisans": artisans}

@router.get("/products/issues")
def list_product_issues(token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    verify_facilitator(client)
    
    res = client.table("products").select(
        "id, title, status, price, stock_quantity, readiness_score, artisan:users!artisan_id(display_name), images:product_images(image_url)"
    ).execute()
    
    issues = []
    for p in res.data:
        missing = []
        if p.get("price") is None: missing.append("missing_price")
        if p.get("stock_quantity") is None or p.get("stock_quantity") == 0: missing.append("missing_stock")
        if not p.get("images"): missing.append("missing_image")
        if (p.get("readiness_score") or 0) < 70: missing.append("low_readiness")
        
        if missing:
            issues.append({
                "product_id": p["id"],
                "title": p.get("title"),
                "image": p.get("images")[0]["image_url"] if p.get("images") else None,
                "artisan_name": p.get("artisan", {}).get("display_name") if p.get("artisan") else None,
                "readiness_score": p.get("readiness_score") or 0,
                "missing": missing
            })
            
    issues.sort(key=lambda x: x["readiness_score"])
    return {"issues": issues}

@router.get("/enquiries")
def list_enquiries(token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    verify_facilitator(client)
    
    res = client.table("buyer_enquiries").select(
        "*, products(title), artisan:users!artisan_id(display_name), buyer:users!buyer_id(display_name)"
    ).order("created_at", desc=True).execute()
    return {"enquiries": res.data}

@router.post("/review/{product_id}")
def submit_review(product_id: str, req: ReviewSubmitRequest, token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    fac_id = verify_facilitator(client)
    
    review_data = {
        "facilitator_id": fac_id,
        "product_id": product_id,
        "review_status": req.review_status,
        "notes": req.notes,
        "reviewed_at": datetime.utcnow().isoformat()
    }
    
    existing = client.table("facilitator_reviews").select("id").eq("product_id", product_id).execute()
    if existing.data:
        client.table("facilitator_reviews").update(review_data).eq("id", existing.data[0]["id"]).execute()
    else:
        client.table("facilitator_reviews").insert(review_data).execute()
        
    return {"status": "success"}
