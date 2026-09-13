from config import settings
from google import genai
from google.genai import types

def get_gemini_client():
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_content(prompt: str, mime_type: str = "application/json") -> str:
    client = get_gemini_client()
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type=mime_type,
        ),
    )
    return response.text

def process_audio_and_generate(audio_file_path: str, prompt: str, mime_type: str = "application/json") -> str:
    client = get_gemini_client()
    
    # Upload to Gemini File API
    gemini_file = client.files.upload(file=audio_file_path)
    
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[gemini_file, prompt],
        config=types.GenerateContentConfig(
            response_mime_type=mime_type,
        ),
    )
    
    # Cleanup
    try:
        client.files.delete(name=gemini_file.name)
    except Exception:
        pass
        
    return response.text

def summarize_market_reasoning(listings: list, low: float, high: float) -> str:
    try:
        client = get_gemini_client()
        listing_details = "\n".join([f"- {l.title} (₹{l.price}) from {l.source}" for l in listings])
        prompt = f"""Given these real marketplace listings and prices:
{listing_details}

Write ONE concise sentence describing the observed market price range for an artisan/buyer.
Do not invent, change, estimate, round, or introduce any price not present in the supplied data. The numeric range is exactly ₹{low} to ₹{high}.
"""
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="text/plain",
            ),
        )
        if response.text:
            return response.text.strip()
    except Exception as e:
        print(f"Gemini Summarize Error: {e}")
        
    # Deterministic fallback
    return f"Based on the available marketplace listings, similar products are currently listed between ₹{low} and ₹{high}."
