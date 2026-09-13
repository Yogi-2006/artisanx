from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class MaterialCost(BaseModel):
    name: str
    quantity: float = Field(..., ge=0)
    unit_cost: float = Field(..., ge=0)

class HiddenCost(BaseModel):
    category: str
    amount: float = Field(..., ge=0)

class PricingInput(BaseModel):
    material_costs: List[MaterialCost]
    hidden_costs: List[HiddenCost]
    labor_hours: float = Field(..., ge=0)
    labor_rate: float = Field(..., ge=0)
    packaging_cost: float = Field(..., ge=0)
    overhead_cost: float = Field(..., ge=0)
    logistics_cost: Optional[float] = Field(0.0, ge=0)
    profit_margin_percent: float = Field(..., ge=0)
    
    # Optional context for market intelligence
    product_id: Optional[str] = None
    category: Optional[str] = None
    materials: Optional[List[str]] = None
    final_price_basis: Optional[str] = None

class PricingOutput(BaseModel):
    total_material_cost: float
    total_hidden_costs: float
    total_labor_cost: float
    total_cost_of_production: float
    profit_amount: float
    min_safe_price: float
    suggested_price: float
    price_range_low: float
    price_range_high: float
    breakdown: Dict[str, float]
    
    # Market Intelligence Fields
    market_price_low: Optional[float] = None
    market_price_high: Optional[float] = None
    market_price_median: Optional[float] = None
    market_price_reasoning: Optional[str] = None
    market_sample_listings: Optional[List[Dict]] = None
    market_data_source: str = "unavailable"
    recommended_final_price: float
