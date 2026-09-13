from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials
from auth.dependencies import get_token, security
from database import get_authenticated_client
from .schemas import PricingInput, PricingOutput
from .service import calculate_price
from market_intelligence.service import get_or_refresh_market_price

router = APIRouter(prefix="/pricing", tags=["pricing"])

@router.post("/calculate", response_model=PricingOutput)
async def route_calculate_price(req: PricingInput, token: HTTPAuthorizationCredentials = Depends(security)) -> PricingOutput:
    client = get_authenticated_client(token.credentials)
    category = req.category
    materials = req.materials

    # If product_id is provided, try to fetch category and materials from DB
    if req.product_id:
        res = client.table("products").select("category, materials").eq("id", req.product_id).execute()
        if res.data:
            prod = res.data[0]
            if not category:
                category = prod.get("category")
            if not materials and prod.get("materials"):
                materials = [m.get("name") for m in prod["materials"].get("list", [])]

    market_data = None
    if category and materials:
        try:
            market_data = await get_or_refresh_market_price(category, materials)
        except Exception as e:
            print(f"Market search failed: {e}")
            pass # Fail gracefully

    return calculate_price(req, market_data)

@router.post("/save/{product_id}")
async def save_pricing_route(product_id: str, req: PricingInput, token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    
    # Verify product ownership and fetch existing context
    res = client.table("products").select("id, category, materials").eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found or access denied")
    
    prod = res.data[0]
    category = prod.get("category")
    materials = [m.get("name") for m in prod.get("materials", {}).get("list", [])]
    
    market_data = None
    if category and materials:
        try:
            market_data = await get_or_refresh_market_price(category, materials)
        except Exception:
            pass

    output = calculate_price(req, market_data)
    
    pricing_data = {
        "product_id": product_id,
        "material_costs": {
            "materials": [m.model_dump() for m in req.material_costs],
            "hidden_costs": [h.model_dump() for h in req.hidden_costs]
        },
        "labor_hours": req.labor_hours,
        "labor_rate": req.labor_rate,
        "packaging_cost": req.packaging_cost,
        "overhead_cost": req.overhead_cost,
        "logistics_cost": req.logistics_cost or 0.0,
        "profit_margin_percent": req.profit_margin_percent,
        "calculated_min_price": output.min_safe_price,
        "calculated_suggested_price": output.suggested_price,
        "price_range_low": output.price_range_low,
        "price_range_high": output.price_range_high,
        "market_price_low": output.market_price_low,
        "market_price_high": output.market_price_high,
        "market_price_reasoning": output.market_price_reasoning,
        "market_data_source": output.market_data_source,
        "market_sample_listings": output.market_sample_listings,
        "final_price_basis": req.final_price_basis
    }
    
    # Upsert pricing input
    existing = client.table("pricing_inputs").select("id").eq("product_id", product_id).execute()
    if existing.data:
        client.table("pricing_inputs").update(pricing_data).eq("product_id", product_id).execute()
    else:
        client.table("pricing_inputs").insert(pricing_data).execute()
        
    # Update product prices
    client.table("products").update({
        "price": output.suggested_price, # This might be overwritten by user's final price but we stick to suggested_price for now if final_price not supplied to product save. Wait, frontend sets `price` via PUT /products/:id.
        "min_safe_price": output.min_safe_price,
        "suggested_price": output.suggested_price
    }).eq("id", product_id).execute()
    
    return {"status": "success", "message": "Pricing saved successfully"}

@router.get("/{product_id}")
def get_pricing_route(product_id: str, token: HTTPAuthorizationCredentials = Depends(security)):
    client = get_authenticated_client(token.credentials)
    
    # Verify product ownership
    res = client.table("products").select("id").eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found or access denied")
        
    pricing = client.table("pricing_inputs").select("*").eq("product_id", product_id).execute()
    if not pricing.data:
        raise HTTPException(status_code=404, detail="Pricing not found")
        
    return pricing.data[0]
