import httpx
import re
import hashlib
from datetime import datetime, timezone
import statistics
from .schemas import MarketPriceResult, MarketListing
from config import settings
from database import get_service_client
from ai.gemini_client import get_gemini_client, process_audio_and_generate

service_client = get_service_client()

def summarize_reasoning(listings: list[MarketListing], low: float, high: float) -> str:
    # We will implement this in gemini_client.py, but for circular dependencies, we can just call it there
    from ai.gemini_client import summarize_market_reasoning
    return summarize_market_reasoning(listings, low, high)

def build_query_signature(category: str, materials: list[str]) -> str:
    cat_norm = category.lower().strip()
    cat_norm = re.sub(r'[^a-z0-9]+', '_', cat_norm)
    
    mats_norm = []
    for m in materials:
        m_norm = m.lower().strip()
        m_norm = re.sub(r'[^a-z0-9]+', '_', m_norm)
        if m_norm:
            mats_norm.append(m_norm)
            
    mats_norm.sort()
    mats_str = "_".join(mats_norm)
    
    raw = f"{cat_norm}___{mats_str}"
    return hashlib.md5(raw.encode('utf-8')).hexdigest()

def clean_price(price_str: str) -> float:
    if not price_str:
        return 0.0
    # Remove everything except digits and decimal point
    cleaned = re.sub(r'[^\d.]', '', price_str)
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

async def search_market_listings(category: str, materials: list[str]) -> list[MarketListing]:
    if not settings.SERPAPI_KEY:
        return []
        
    base_mats = " ".join(materials[:2]) # Top 2 materials
    
    # We'll run one generic shopping search to get a mix of sources.
    # Searching for Amazon India and Flipkart explicitly
    queries = [
        f"{category} {base_mats} handmade amazon india",
        f"{category} {base_mats} handmade flipkart",
        f"{category} {base_mats} Amazon Karigar"
    ]
    
    all_listings = []
    
    import asyncio
    
    async with httpx.AsyncClient() as client:
        async def fetch(query):
            try:
                response = await client.get(
                    "https://serpapi.com/search",
                    params={
                        "engine": "google",
                        "q": query,
                        "tbm": "shop",
                        "api_key": settings.SERPAPI_KEY,
                        "gl": "in",
                        "hl": "en"
                    },
                    timeout=20.0
                )
                if response.status_code == 200:
                    return response.json().get("shopping_results", [])
            except httpx.ReadTimeout:
                print("SerpApi request timed out")
            except Exception as e:
                print(f"SerpApi Error: {e}")
            return []
            
        results = await asyncio.gather(*(fetch(q) for q in queries))
        for shopping_results in results:
            for item in shopping_results:
                title = item.get("title", "")
                price_str = item.get("price", "")
                source = item.get("source", "Unknown")
                url = item.get("product_link") or item.get("link") or ""
                
                price = clean_price(price_str)
                
                if title and price > 0 and url:
                    all_listings.append(MarketListing(
                        title=title,
                        price=price,
                        source=source,
                        url=url
                    ))
                
    # Deduplicate by URL
    seen_urls = set()
    unique_listings = []
    for l in all_listings:
        if l.url not in seen_urls:
            seen_urls.add(l.url)
            unique_listings.append(l)
            
    return unique_listings

def filter_outliers(listings: list[MarketListing], category: str, materials: list[str]) -> list[MarketListing]:
    # 1. Relevance Filtering
    # Check if category keywords or material keywords are in title
    cat_keywords = set(re.findall(r'\w+', category.lower()))
    mat_keywords = set()
    for m in materials:
        mat_keywords.update(re.findall(r'\w+', m.lower()))
        
    relevant_listings = []
    for l in listings:
        title_lower = l.title.lower()
        # Basic check: title should contain at least one category keyword or one material keyword
        # or just be permissive if the title isn't empty, since Google Shopping does relevance anyway.
        # But to be safe, let's enforce at least some overlap.
        title_words = set(re.findall(r'\w+', title_lower))
        if cat_keywords.intersection(title_words) or mat_keywords.intersection(title_words) or "handmade" in title_lower or "artisan" in title_lower:
            relevant_listings.append(l)
            
    if not relevant_listings:
        return []
        
    # 2. Outlier Filtering (IQR)
    prices = sorted([l.price for l in relevant_listings])
    
    if len(prices) < 3:
        return []
        
    q1 = prices[len(prices) // 4]
    q3 = prices[(len(prices) * 3) // 4]
    iqr = q3 - q1
    
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    filtered_listings = [l for l in relevant_listings if lower_bound <= l.price <= upper_bound]
    
    return filtered_listings[:8] # Cap at 8

async def get_or_refresh_market_price(category: str, materials: list[str]) -> MarketPriceResult:
    sig = build_query_signature(category, materials)
    
    # Check Cache
    try:
        cache_res = service_client.table("market_price_cache").select("*").eq("query_signature", sig).execute()
        if cache_res.data:
            row = cache_res.data[0]
            fetched_at = datetime.fromisoformat(row["fetched_at"].replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            delta = now - fetched_at
            if delta.total_seconds() < 48 * 3600:
                # Valid cache
                return MarketPriceResult(
                    price_low=row["price_low"],
                    price_high=row["price_high"],
                    price_median=row["price_median"],
                    listings=[MarketListing(**item) for item in row.get("source_listings", [])],
                    reasoning=None, # Will generate below if needed, or we could cache it. Let's not cache reasoning in DB right now, or wait, it's not in DB schema.
                    is_cached=True,
                    status="success"
                )
    except Exception as e:
        print(f"Cache check error: {e}")
        
    # Fetch from live
    listings = await search_market_listings(category, materials)
    filtered = filter_outliers(listings, category, materials)
    
    if len(filtered) < 3:
        return MarketPriceResult(status="insufficient_data")
        
    prices = sorted([l.price for l in filtered])
    low = prices[0]
    high = prices[-1]
    median = statistics.median(prices)
    
    # Summarize
    from ai.gemini_client import summarize_market_reasoning
    reasoning = summarize_market_reasoning(filtered, low, high)
    
    # Upsert Cache
    try:
        data_to_upsert = {
            "query_signature": sig,
            "price_low": low,
            "price_high": high,
            "price_median": median,
            "source_listings": [l.model_dump() for l in filtered]
        }
        
        # Checking if exists again to be safe
        cache_res = service_client.table("market_price_cache").select("id").eq("query_signature", sig).execute()
        if cache_res.data:
            service_client.table("market_price_cache").update(data_to_upsert).eq("query_signature", sig).execute()
        else:
            service_client.table("market_price_cache").insert(data_to_upsert).execute()
    except Exception as e:
        print(f"Cache upsert error: {e}")
        
    return MarketPriceResult(
        price_low=low,
        price_high=high,
        price_median=median,
        listings=filtered,
        reasoning=reasoning,
        is_cached=False,
        status="success"
    )
