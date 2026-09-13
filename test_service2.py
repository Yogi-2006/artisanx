import sys
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ai_catalogue.service import generate_catalogue

try:
    response = generate_catalogue("", "unknown", "en")
    print("Success:", response)
except Exception as e:
    import traceback
    traceback.print_exc()
