import sys
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ai.gemini_client import generate_content

try:
    response = generate_content("Say hello", mime_type="application/json")
    print("Success:", response)
except Exception as e:
    print("Error:", e)
