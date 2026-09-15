from fastapi import HTTPException
from typing import Any
from database import supabase_client
from .schemas import ProductCreate, ProductUpdate

def create_product(product: ProductCreate, artisan_id: str, auth_client: Any):
    data = product.model_dump(exclude_unset=True)
    data["artisan_id"] = artisan_id
    
    res = auth_client.table("products").insert(data).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise HTTPException(status_code=500, detail="Failed to create product")

def get_product(product_id: str, artisan_id: str, auth_client: Any):
    res = auth_client.table("products").select("*").eq("id", product_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product = res.data[0]
    if product.get("artisan_id") != artisan_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    rev_res = auth_client.table("facilitator_reviews").select("review_status, notes, flags").eq("product_id", product_id).execute()
    if rev_res.data:
        rev = rev_res.data[0]
        product["review_status"] = rev.get("review_status")
        product["review_notes"] = rev.get("notes")
        product["review_flags"] = rev.get("flags")
        
    return product

def update_product(product_id: str, product: ProductUpdate, artisan_id: str, auth_client: Any):
    # Verify ownership
    existing = get_product(product_id, artisan_id, auth_client)
    
    data = product.model_dump(exclude_unset=True)
    if not data:
        return existing
        
    res = auth_client.table("products").update(data).eq("id", product_id).execute()
    if res.data and len(res.data) > 0:
        # If it was flagged by facilitator, mark as resubmitted
        auth_client.table("facilitator_reviews").update({"review_status": "resubmitted"}).eq("product_id", product_id).eq("review_status", "needs_changes").execute()
        return res.data[0]
    raise HTTPException(status_code=500, detail="Failed to update product")

def delete_product(product_id: str, artisan_id: str, auth_client: Any):
    # Verify ownership
    get_product(product_id, artisan_id, auth_client)
    
    # Soft delete
    res = auth_client.table("products").update({"status": "archived"}).eq("id", product_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise HTTPException(status_code=500, detail="Failed to delete product")

def unpublish_product(product_id: str, artisan_id: str, auth_client: Any):
    # Verify ownership
    get_product(product_id, artisan_id, auth_client)
    
    # Unpublish
    res = auth_client.table("products").update({"status": "draft"}).eq("id", product_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise HTTPException(status_code=500, detail="Failed to unpublish product")

def get_my_products(artisan_id: str, auth_client: Any, status: str = None, search: str = None):
    query = auth_client.table("products").select("*").eq("artisan_id", artisan_id).neq("status", "archived")
    
    if status:
        query = query.eq("status", status)
        
    if search:
        query = query.ilike("title", f"%{search}%")
        
    query = query.order("created_at", desc=True)
    res = query.execute()
    
    products = res.data or []
    
    # Optionally attach main image and review status
    if len(products) > 0:
        product_ids = [p["id"] for p in products]
        
        # Attach images
        img_res = auth_client.table("product_images").select("product_id, image_url").in_("product_id", product_ids).eq("is_main", True).execute()
        img_map = {img["product_id"]: img["image_url"] for img in (img_res.data or [])}
        
        # Attach review status
        review_res = auth_client.table("facilitator_reviews").select("product_id, review_status, notes, flags").in_("product_id", product_ids).execute()
        review_map = {r["product_id"]: r for r in (review_res.data or [])}
        
        for p in products:
            p["main_image"] = img_map.get(p["id"])
            rev = review_map.get(p["id"])
            if rev:
                p["review_status"] = rev.get("review_status")
                p["review_notes"] = rev.get("notes")
                p["review_flags"] = rev.get("flags")
            
    return products

from typing import Any

def calculate_readiness(product_id: str, artisan_id: str, auth_client: Any):
    res = auth_client.table("products").select("*").eq("id", product_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    product = res.data[0]
    if product.get("artisan_id") != artisan_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    images_res = auth_client.table("product_images").select("*").eq("product_id", product_id).execute()
    images = images_res.data or []
    
    profile_res = auth_client.table("artisan_profiles").select("verification_status").eq("id", artisan_id).execute()
    profile = profile_res.data[0] if profile_res.data and len(profile_res.data) > 0 else {}
    verification_status = profile.get("verification_status")

    points = 0
    missing = []

    if any(img.get("is_main") for img in images):
        points += 15
    else:
        missing.append({"field": "main_image", "points": 15, "message": "Set a main product image"})

    if len(images) >= 2:
        points += 5
    else:
        missing.append({"field": "additional_images", "points": 5, "message": "Add at least 2 product images"})

    if product.get("title"):
        points += 10
    else:
        missing.append({"field": "title", "points": 10, "message": "Add a product title"})

    if product.get("description") and len(product.get("description", "")) >= 20:
        points += 10
    else:
        missing.append({"field": "description", "points": 10, "message": "Add a description (min 20 characters)"})

    if product.get("category"):
        points += 5
    else:
        missing.append({"field": "category", "points": 5, "message": "Select a product category"})

    if product.get("tags") and len(product.get("tags", [])) >= 3:
        points += 5
    else:
        missing.append({"field": "tags", "points": 5, "message": "Add at least 3 tags"})

    materials = product.get("materials")
    if materials and isinstance(materials, dict) and "list" in materials and len(materials["list"]) > 0:
        points += 10
    elif materials and isinstance(materials, list) and len(materials) > 0:
        points += 10
    else:
        missing.append({"field": "materials", "points": 10, "message": "List your materials"})

    if product.get("price") and float(product.get("price", 0)) > 0:
        points += 10
    else:
        missing.append({"field": "price", "points": 10, "message": "Set a final price"})

    if product.get("stock_quantity") is not None and product.get("stock_quantity") >= 0:
        points += 5
    else:
        missing.append({"field": "stock_quantity", "points": 5, "message": "Set stock quantity"})

    if product.get("moq") is not None and product.get("moq") >= 1:
        points += 5
    else:
        missing.append({"field": "moq", "points": 5, "message": "Set Minimum Order Quantity (MOQ)"})

    if product.get("lead_time_days") is not None and product.get("lead_time_days") >= 0:
        points += 5
    else:
        missing.append({"field": "lead_time_days", "points": 5, "message": "Set production lead time"})

    if product.get("dimensions"):
        points += 5
    else:
        missing.append({"field": "dimensions", "points": 5, "message": "Add product dimensions"})

    if product.get("care_instructions"):
        points += 5
    else:
        missing.append({"field": "care_instructions", "points": 5, "message": "Add care instructions"})

    v_points = 0
    if verification_status == "cooperative_verified":
        v_points = 5
    elif verification_status == "facilitator_reviewed":
        v_points = 5
    elif verification_status == "documentation_pending":
        v_points = 2
    
    if v_points > 0:
        points += v_points
    else:
        missing.append({"field": "verification", "points": 5, "message": "Profile verification pending"})

    points = min(points, 100)
    is_publishable = points >= 70

    auth_client.table("products").update({"readiness_score": points}).eq("id", product_id).execute()

    return {
        "total_score": points,
        "missing_fields": missing,
        "is_publishable": is_publishable
    }

def publish_product(product_id: str, artisan_id: str, auth_client: Any):
    readiness = calculate_readiness(product_id, artisan_id, auth_client)
    
    if not readiness["is_publishable"]:
        raise HTTPException(status_code=400, detail={"message": "Product not ready for publishing", "readiness": readiness})
        
    res = auth_client.table("products").update({"status": "published"}).eq("id", product_id).execute()
    
    if res.data and len(res.data) > 0:
        from passports.service import generate_passport
        generate_passport(product_id, auth_client, artisan_id)
        
        from notifications.service import create_notification
        create_notification(
            user_id=artisan_id,
            type="product_published",
            title="Product published successfully",
            message="Your product is now live on the platform.",
            metadata={"product_id": product_id}
        )
        
        return {"status": "published", "message": "Product published successfully"}
        
    raise HTTPException(status_code=500, detail="Failed to publish product")

def get_catalogue(
    search: str = None,
    category: str = None,
    craft_type: str = None,
    min_price: float = None,
    max_price: float = None,
    location: str = None,
    state: str = None,
    material: str = None,
    max_moq: int = None,
    max_lead_time: int = None,
    in_stock: bool = None,
    made_to_order: bool = None,
    sort_by: str = "newest",
    page: int = 1,
    per_page: int = 20
):
    from database import supabase_client
    
    query = supabase_client.table("products").select("id, title, price, category, created_at, moq, lead_time_days, stock_quantity, is_made_to_order, materials, artisan_id").eq("status", "published")
    
    if search:
        query = query.ilike("title", f"%{search}%")
    if category:
        query = query.eq("category", category)
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)
    if max_moq is not None:
        query = query.lte("moq", max_moq)
    if max_lead_time is not None:
        query = query.lte("lead_time_days", max_lead_time)
    if in_stock:
        query = query.gt("stock_quantity", 0)
    if made_to_order:
        query = query.eq("is_made_to_order", True)
        
    res = query.execute()
    products = res.data or []
    
    if not products:
        return {"items": [], "total": 0, "page": page, "per_page": per_page}
        
    product_ids = [p["id"] for p in products]
    artisan_ids = list(set([p["artisan_id"] for p in products if p.get("artisan_id")]))
    
    # Fetch artisan_profiles for state filtering
    profiles_res = supabase_client.table("artisan_profiles").select("user_id, state").in_("user_id", artisan_ids).execute()
    profiles_map = {pr["user_id"]: pr for pr in (profiles_res.data or [])}
    
    # Fetch product_passports to get artisan info and images (since artisan_profiles and product_images lack anon grants)
    passports_res = supabase_client.table("product_passports").select("product_id, passport_data").in_("product_id", product_ids).execute()
    passports_map = {}
    for pp in (passports_res.data or []):
        data = pp.get("passport_data") or {}
        
        main_img = None
        images = data.get("images", [])
        for img in images:
            if img.get("is_main"):
                main_img = img.get("image_url")
                break
        if not main_img and images:
            main_img = images[0].get("image_url")
            
        passports_map[pp["product_id"]] = {
            "artisan_name": data.get("artisan_name"),
            "location": data.get("craft_location"),
            "main_image": main_img
        }
    
    # Client-side filter for passport fields
    filtered = []
    for p in products:
        a = passports_map.get(p["id"], {})
        
        # We don't have craft_type in passport data, so we map category if craft_type is requested
        # Or we just skip filtering if it's missing
        if craft_type and p.get("category") != craft_type: # Fallback to category for craft_type
            continue
        if location and location.lower() not in (a.get("location") or "").lower():
            continue
            
        # Check material
        if material:
            mats = p.get("materials") or {}
            mat_list = mats.get("list", []) if isinstance(mats, dict) else (mats if isinstance(mats, list) else [])
            mat_names = [m.get("name", "").lower() for m in mat_list if isinstance(m, dict)]
            if material.lower() not in mat_names:
                continue

        # Check state
        if state:
            artisan_profile = profiles_map.get(p.get("artisan_id"), {})
            p_state = artisan_profile.get("state") or ""
            if state.lower() != p_state.lower():
                continue

        filtered.append({
            "id": p["id"],
            "title": p.get("title"),
            "main_image": a.get("main_image"),
            "price": p.get("price"),
            "artisan_id": p.get("artisan_id"),
            "artisan_name": a.get("artisan_name"),
            "location": a.get("location"),
            "state": profiles_map.get(p.get("artisan_id"), {}).get("state"),
            "craft_type": p.get("category"), # Fallback
            "moq": p.get("moq"),
            "lead_time_days": p.get("lead_time_days"),
            "stock_quantity": p.get("stock_quantity"),
            "is_made_to_order": p.get("is_made_to_order"),
            "created_at": p.get("created_at")
        })
        
    # Sort
    if sort_by == "price_low":
        filtered.sort(key=lambda x: float(x["price"] or 0))
    elif sort_by == "price_high":
        filtered.sort(key=lambda x: float(x["price"] or 0), reverse=True)
    else: # newest
        filtered.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        
    # Paginate
    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    paginated = filtered[start:end]
    
    # Remove internal fields not in schema
    for item in paginated:
        item.pop("created_at", None)
        
    return {
        "items": paginated,
        "total": total,
        "page": page,
        "per_page": per_page
    }

def get_catalogue_detail(product_id: str):
    from database import supabase_client
    from fastapi import HTTPException
    
    res = supabase_client.table("products").select("*").eq("id", product_id).eq("status", "published").execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Published product not found")
        
    product = res.data[0]
    
    # Passport (Contains Artisan Info and Images since they are protected)
    from passports.service import get_passport
    passport_data = None
    try:
        passport_data = get_passport(product_id)
    except Exception:
        pass
        
    artisan = {}
    images = []
    if passport_data and passport_data.get("passport_data"):
        data = passport_data["passport_data"]
        artisan = {
            "id": product.get("artisan_id"),
            "artisan_name": data.get("artisan_name"),
            "location": data.get("craft_location"),
            "craft_story": data.get("artisan_story"),
            "craft_type": product.get("category") # Fallback
        }
        images = data.get("images", [])
        
    # Strip private info from product
    product.pop("min_safe_price", None)
    product.pop("suggested_price", None)
    
    def clean_materials(m_raw):
        if not m_raw: return None
        if isinstance(m_raw, dict) and "list" in m_raw:
            safe_list = []
            for m in m_raw["list"]:
                if isinstance(m, dict):
                    safe_list.append({"name": m.get("name")})
            return {"list": safe_list}
        return m_raw

    product["materials"] = clean_materials(product.get("materials"))
    
    if passport_data and passport_data.get("passport_data"):
        pd = passport_data["passport_data"]
        if pd.get("materials"):
            pd["materials"] = clean_materials(pd.get("materials"))
            
    return {
        "product": product,
        "images": images,
        "artisan": artisan,
        "passport": passport_data
    }
