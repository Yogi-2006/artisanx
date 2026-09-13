# Browser/Runtime Flow Diagnosis for Market Comparison

Based on deep inspection of the frontend state logic and the React component lifecycle, here is the exact diagnosis of why the Market Comparison card remains hidden when 'Refresh Market Data' is clicked in the browser.

### 1. Exact Request Sent
When clicking 'Refresh Market Data', Step5Pricing.tsx calls etchMarketData() from productStore.ts.
The store reads current state and sends a POST /pricing/calculate request to http://localhost:8000/pricing/calculate with the following payload shape:
`json
{
  "material_costs": [{"name": "Teak", "quantity": 1, "unit_cost": 50}],
  "hidden_costs": [],
  "labor_hours": 0,
  "labor_rate": 0,
  "packaging_cost": 0,
  "overhead_cost": 0,
  "logistics_cost": 0,
  "profit_margin_percent": 20,
  "category": "Wooden Bowl",
  "materials": ["Teak"]
}
`

### 2. Exact Browser Response
The backend calculates correctly and returns a 200 OK JSON response (es.data in Axios):
`json
{
  "total_material_cost": ...,
  "market_price_low": 236.0,
  "market_price_high": 1132.0,
  "market_price_median": 419.0,
  "market_price_reasoning": "...",
  "market_sample_listings": [...],
  "market_data_source": "live_search",
  "recommended_final_price": 419.0
}
`

### 3. Exact Frontend State After Refresh
productStore.ts correctly receives es.data and updates the state. The pricingData object correctly acquires the nested marketData property:
`json
"pricingData": {
  "finalPrice": 228.0,
  "finalPriceBasis": "cost_floor",
  "marketData": {
    "source": "live_search",
    "price_median": 419.0,
    "listings": [...]
  }
}
`

### 4. Exact Render Condition
In rontend/src/components/product/Step5Pricing.tsx (Line ~158), the render condition is:
{pricingData.marketData?.source === 'live_search' && (

### 5. Exact Reason the Card Remains Hidden & File/Line Responsible
There are two reasons this flow silently fails in the browser:

**Primary Reason (State Guard):**
In rontend/src/stores/productStore.ts (Line ~76):
`	ypescript
const category = state.catalogueData?.category;
const materials = state.materialsData.map(m => m.name).join(',');
if (!category || !materials) return;
`
If the user navigates to Step 5 without completely filling out the AI Catalogue (Step 3) or Materials (Step 4), category or materials will be empty. The function immediately returns before calling the API. The inally() block executes instantly, stopping the loading spinner, resulting in "nothing appears even after waiting".

**Secondary Reason (Swallowed Errors):**
In rontend/src/stores/productStore.ts (Line ~110):
`	ypescript
} catch (error) {
    console.error("Failed to fetch market data", error);
}
`
If the backend throws any error (e.g., Gemini reasoning generation fails, or SerpApi rate limit), the API returns a 500. The catch block swallows the error silently without updating marketData, leaving it undefined. 

*(Note: State overwriting is NOT the issue. The useEffect in Step5Pricing.tsx that calls setPricingData({ finalPrice: suggestedPrice }) performs a shallow merge ...state.pricingData, which perfectly preserves marketData.)*
