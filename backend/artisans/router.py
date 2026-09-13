from fastapi import APIRouter, Depends, UploadFile, File
from typing import Any
from . import schemas
from . import service
from auth.dependencies import get_current_user, get_token

router = APIRouter(prefix="/artisans", tags=["artisans"])

@router.get("/me", response_model=schemas.ArtisanProfileResponse)
def route_get_my_profile(current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.get_profile(current_user["id"], token)

@router.post("/me", response_model=schemas.ArtisanProfileResponse)
def route_create_my_profile(profile: schemas.ArtisanProfileCreate, current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.create_profile(current_user["id"], profile, token)

@router.put("/me", response_model=schemas.ArtisanProfileResponse)
def route_update_my_profile(profile: schemas.ArtisanProfileUpdate, current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.update_profile(current_user["id"], profile, token)

@router.post("/me/photo")
def route_upload_my_photo(file: UploadFile = File(...), current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.upload_profile_photo(current_user["id"], file, token)

@router.get("/{artisan_id}", response_model=schemas.ArtisanProfileResponse)
def route_get_profile(artisan_id: str, current_user: Any = Depends(get_current_user), token: str = Depends(get_token)):
    return service.get_profile_by_id(artisan_id, token)
