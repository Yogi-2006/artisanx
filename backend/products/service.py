from .schemas import ProductCreate

def create_product(product: ProductCreate) -> dict:
    return {"id": "product_id"}

def get_product(product_id: str) -> dict:
    return {"id": product_id}

def publish_product(product_id: str) -> dict:
    return {"status": "published"}
