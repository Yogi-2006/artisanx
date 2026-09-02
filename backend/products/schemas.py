from pydantic import BaseModel
from typing import Optional, List

class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    price: Optional[float] = None
