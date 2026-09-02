from supabase import create_client, Client
from config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

supabase_client = get_supabase_client()
