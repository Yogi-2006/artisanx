import sys
import os
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ai.gemini_client import generate_content

prompt = f\"\"\"
You are a product catalogue assistant for Indian artisan crafts. 
Given this voice description by an artisan: ""
And suggested category: "unknown"

Generate the following product details:
1. Product title
2. Product description
3. Category
4. Tags (array of strings)
5. Suggested materials list (array of strings)
6. Care instructions
7. Estimated production time
8. Dimensions and/or weight (if mentioned, otherwise empty string)

Do not invent certifications, GI status, craft origin, authenticity claims, materials, 
or other factual claims that are not supported by the artisan's description.

Respond in JSON format EXACTLY matching this structure:
{{
    "title": "...",
    "description": "...",
    "category": "...",
    "tags": ["...", "..."],
    "materials": ["...", "..."],
    "care_instructions": "...",
    "estimated_production_time": "...",
    "dimensions": "..."
}}
\"\"\"

response_json = generate_content(prompt, mime_type="application/json")
print("RAW RESPONSE:")
print(response_json)

try:
    data = json.loads(response_json)
    print("JSON PARSED SUCCESSFULLY")
except Exception as e:
    print("JSON PARSE ERROR:", e)
