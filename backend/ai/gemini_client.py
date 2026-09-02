class GeminiClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def generate_content(self, prompt: str) -> str:
        return "placeholder"

def get_gemini_client() -> GeminiClient:
    return GeminiClient("placeholder")
