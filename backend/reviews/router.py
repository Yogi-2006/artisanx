from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user, get_token
from database import get_authenticated_client
from .schemas import ReviewCreate
from notifications.service import create_notification

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/")
def create_review(req: ReviewCreate, current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    client = get_authenticated_client(token)
    user_id = current_user["id"]
    if current_user.get("role") != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can submit reviews")
        
    # Check if order is completed and belongs to user
    ord_res = client.table("orders").select("*, products(title)").eq("id", req.order_id).execute()
    if not ord_res.data or ord_res.data[0]["buyer_id"] != user_id:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = ord_res.data[0]
    if order["status"] != "completed":
        raise HTTPException(status_code=400, detail="Reviews can only be submitted for completed orders")
        
    # Check if review already exists
    rev_check = client.table("buyer_reviews").select("id").eq("order_id", req.order_id).execute()
    if rev_check.data:
        raise HTTPException(status_code=400, detail="Order already reviewed")
        
    review_data = {
        "order_id": req.order_id,
        "product_id": order["product_id"],
        "artisan_id": order["artisan_id"],
        "buyer_id": user_id,
        "rating_overall": req.rating_overall,
        "rating_quality": req.rating_quality,
        "rating_communication": req.rating_communication,
        "rating_timeliness": req.rating_timeliness,
        "review_text": req.review_text,
        "is_verified_buyer": True
    }
    
    r_res = client.table("buyer_reviews").insert(review_data).execute()
    if not r_res.data:
        raise HTTPException(status_code=500, detail="Failed to create review")
        
    # Send notification
    product_title = order.get("products", {}).get("title", "a product")
    create_notification(
        user_id=order["artisan_id"],
        type="review_received",
        title=f"New {req.rating_overall}-star Review!",
        message=f"You received a new review for {product_title}.",
        metadata={"review_id": r_res.data[0]["id"], "order_id": req.order_id, "rating": req.rating_overall}
    )
    
    return {"status": "success", "review": r_res.data[0]}

@router.get("/artisan")
def get_artisan_reviews(current_user: dict = Depends(get_current_user), token: str = Depends(get_token)):
    client = get_authenticated_client(token)
    
    # We fetch all reviews for this artisan
    res = client.table("buyer_reviews").select("*, products(title), buyer:users!buyer_id(display_name)").eq("artisan_id", current_user["id"]).order("created_at", desc=True).execute()
    reviews = res.data or []
    
    # Calculate aggregates
    total = len(reviews)
    agg = {
        "overall": 0,
        "quality": 0,
        "communication": 0,
        "timeliness": 0
    }
    
    if total > 0:
        agg["overall"] = round(sum(r.get("rating_overall", 0) for r in reviews) / total, 1)
        agg["quality"] = round(sum(r.get("rating_quality", 0) for r in reviews) / total, 1)
        agg["communication"] = round(sum(r.get("rating_communication", 0) for r in reviews) / total, 1)
        agg["timeliness"] = round(sum(r.get("rating_timeliness", 0) for r in reviews) / total, 1)
        
    return {
        "reviews": reviews,
        "aggregates": agg,
        "total_reviews": total
    }
