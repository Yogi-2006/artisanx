import asyncio
import sys
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from pricing.service import calculate_pricing_with_market_intelligence
from pricing.schemas import PricingInput, MaterialCost, HiddenCost

async def main():
    req = PricingInput(
        material_costs=[MaterialCost(name="Teak", quantity=1.0, unit_cost=50.0)],
        hidden_costs=[],
        labor_hours=2.0,
        labor_rate=50.0,
        packaging_cost=10.0,
        overhead_cost=10.0,
        logistics_cost=20.0,
        profit_margin_percent=20.0,
        category="Wooden Bowl",
        materials=["Teak", "Wood"]
    )
    res = await calculate_pricing_with_market_intelligence(req)
    print("Pricing Calculation Result:")
    print(f"Min Safe Price: {res.min_safe_price}")
    print(f"Suggested Price: {res.suggested_price}")
    print(f"Recommended Final: {res.recommended_final_price}")
    print(f"Market Data Source: {res.market_data_source}")
    print(f"Market Sample Listings: {len(res.market_sample_listings or [])}")

if __name__ == '__main__':
    asyncio.run(main())
