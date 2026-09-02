from fastapi import APIRouter
from .schemas import ProductCreate
from .service import create_product, get_product, publish_product

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/")
def route_create_product(product: ProductCreate) -> dict:
    return create_product(product)

@router.get("/{product_id}")
def route_get_product(product_id: str) -> dict:
    return get_product(product_id)

@router.post("/{product_id}/publish")
def route_publish_product(product_id: str) -> dict:
    return publish_product(product_id)
