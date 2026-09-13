import httpx, asyncio, os
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def test():
    async with httpx.AsyncClient() as c:
        try:
            r = await c.get('https://serpapi.com/search', params={
                'engine': 'google',
                'q': 'test',
                'tbm': 'shop',
                'gl': 'in',
                'hl': 'en',
                'api_key': os.getenv('SERPAPI_KEY')
            }, timeout=30.0)
            print(f"Status: {r.status_code}")
            print(f"Response: {r.text[:500]}")
            if r.status_code == 200:
                data = r.json()
                shopping_results = data.get("shopping_results", [])
                print(f"Found {len(shopping_results)} shopping results.")
                if shopping_results:
                    print("Sample item fields:", list(shopping_results[0].keys()))
        except Exception as e:
            print(f"Error type: {type(e)}")
            print(f"Error: {e}")
        
asyncio.run(test())
