from .schemas import ArtisanProfileCreate

def create_profile(profile: ArtisanProfileCreate) -> dict:
    return {"id": "profile_id"}

def get_profile(artisan_id: str) -> dict:
    return {"id": artisan_id}
