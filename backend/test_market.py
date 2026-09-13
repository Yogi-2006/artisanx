import asyncio
from market_intelligence.service import search_market_listings, filter_outliers, get_or_refresh_market_price
from pricing.service import calculate_price
from pricing.schemas import PricingInput, MaterialCost, HiddenCost

async def run_tests():
    print("Running A. REAL PRODUCT SEARCH (SerpApi mocking basically, we don't have a real key usually but let's test the functions)...")
    listings = await search_market_listings("handloom cotton kurta", ["cotton"])
    print(f"Listings found: {len(listings)}")
    
    print("\nRunning B. OUTLIERS")
    from market_intelligence.schemas import MarketListing
    noisy = [
        MarketListing(title="cotton kurta", price=1000, source="A", url="1"),
        MarketListing(title="kurta", price=1200, source="B", url="2"),
        MarketListing(title="kurta", price=1100, source="C", url="3"),
        MarketListing(title="kurta", price=1150, source="D", url="4"),
        MarketListing(title="kurta", price=10000, source="E", url="5"), # Outlier
        MarketListing(title="shoe", price=1100, source="F", url="6"), # Irrelevant
    ]
    filtered = filter_outliers(noisy, "handloom cotton kurta", ["cotton"])
    print(f"Filtered: {[l.price for l in filtered]}")
    assert all(l.price < 5000 for l in filtered)
    
    print("\nRunning E. EXISTING PRICING REGRESSION")
    inp = PricingInput(
        material_costs=[MaterialCost(name="Clay", quantity=2, unit_cost=100)],
        hidden_costs=[HiddenCost(category="Glaze", amount=50)],
        labor_hours=5,
        labor_rate=100,
        packaging_cost=50,
        overhead_cost=100,
        logistics_cost=0,
        profit_margin_percent=20
    )
    res = calculate_price(inp)
    assert res.total_cost_of_production == (200 + 50 + 500 + 50 + 100) # 900
    assert res.min_safe_price == 990.0
    assert res.suggested_price == 1080.0
    print(f"Regression passed! Suggested Price: {res.suggested_price}")
    
    print("\nAll tests passed locally!")

if __name__ == "__main__":
    asyncio.run(run_tests())
