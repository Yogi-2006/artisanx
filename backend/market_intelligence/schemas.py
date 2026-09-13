from pydantic import BaseModel, Field
from typing import List, Optional

class MarketListing(BaseModel):
    title: str
    price: float
    source: str
    url: str

class MarketPriceResult(BaseModel):
    price_low: Optional[float] = None
    price_high: Optional[float] = None
    price_median: Optional[float] = None
    listings: List[MarketListing] = []
    reasoning: Optional[str] = None
    is_cached: bool = False
    status: str = "success" # can be 'insufficient_data'
