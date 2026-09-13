from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from auth.dependencies import security
from .schemas import MarketPriceResult
from .service import get_or_refresh_market_price

router = APIRouter(prefix="/market-intelligence", tags=["market-intelligence"])

@router.get("/estimate", response_model=MarketPriceResult)
async def estimate_market_price(
    category: str = Query(...),
    materials: str = Query(...),
    token: HTTPAuthorizationCredentials = Depends(security)
):
    mat_list = [m.strip() for m in materials.split(",") if m.strip()]
    if not category or not mat_list:
        raise HTTPException(status_code=400, detail="Category and at least one material are required")
        
    return await get_or_refresh_market_price(category, mat_list)
