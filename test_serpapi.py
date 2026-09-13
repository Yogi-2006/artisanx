import asyncio
import sys
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from market_intelligence.service import search_market_listings, filter_outliers

async def main():
    print("Testing SerpApi search...")
    listings = await search_market_listings('Wooden Bowl', ['Teak', 'Wood'])
    print(f"Got {len(listings)} listings:")
    for l in listings[:5]:
        print(f"- {l.title} ({l.price}) [{l.source}] {l.url}")
        
    filtered = filter_outliers(listings, 'Wooden Bowl', ['Teak', 'Wood'])
    print(f"\nFiltered down to {len(filtered)} listings:")
    for l in filtered[:5]:
        print(f"- {l.title} ({l.price})")

if __name__ == '__main__':
    asyncio.run(main())
