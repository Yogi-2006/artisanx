from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from . import schemas
from . import service
from auth.dependencies import get_current_user, security
from database import get_authenticated_client
from fastapi.security import HTTPAuthorizationCredentials

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=schemas.ProductResponse)
def route_create_product(product: schemas.ProductCreate, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.create_product(product, current_user["id"], auth_client)

@router.get("/my", response_model=List[schemas.ProductResponse])
def route_get_my_products(status: str = None, search: str = None, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.get_my_products(current_user["id"], auth_client, status, search)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def route_get_product(product_id: str, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.get_product(product_id, current_user["id"], auth_client)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def route_update_product(product_id: str, product: schemas.ProductUpdate, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.update_product(product_id, product, current_user["id"], auth_client)

@router.delete("/{product_id}", response_model=schemas.ProductResponse)
def route_delete_product(product_id: str, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.delete_product(product_id, current_user["id"], auth_client)

@router.put("/{product_id}/unpublish", response_model=schemas.ProductResponse)
def route_unpublish_product(product_id: str, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.unpublish_product(product_id, current_user["id"], auth_client)

@router.get("/{product_id}/readiness", response_model=schemas.ReadinessResponse)
def route_get_readiness(product_id: str, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.calculate_readiness(product_id, current_user["id"], auth_client)

@router.post("/{product_id}/publish")
def route_publish_product(product_id: str, current_user: Any = Depends(get_current_user), token: HTTPAuthorizationCredentials = Depends(security)):
    auth_client = get_authenticated_client(token.credentials)
    return service.publish_product(product_id, current_user["id"], auth_client)

@router.get("/catalogue/list", response_model=schemas.CatalogueResponse)
def route_get_catalogue(
    search: str = None,
    category: str = None,
    craft_type: str = None,
    min_price: float = None,
    max_price: float = None,
    location: str = None,
    sort_by: str = "newest",
    page: int = 1,
    per_page: int = 20
):
    return service.get_catalogue(search, category, craft_type, min_price, max_price, location, sort_by, page, per_page)

@router.get("/catalogue/detail/{product_id}", response_model=schemas.CatalogueDetailResponse)
def route_get_catalogue_detail(product_id: str):
    return service.get_catalogue_detail(product_id)
