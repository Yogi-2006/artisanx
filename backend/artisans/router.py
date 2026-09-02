from fastapi import APIRouter
from .schemas import ArtisanProfileCreate
from .service import create_profile, get_profile

router = APIRouter(prefix="/artisans", tags=["artisans"])

@router.post("/")
def route_create_profile(profile: ArtisanProfileCreate) -> dict:
    return create_profile(profile)

@router.get("/{artisan_id}")
def route_get_profile(artisan_id: str) -> dict:
    return get_profile(artisan_id)
