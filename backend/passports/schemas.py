from pydantic import BaseModel

class PassportGenerateRequest(BaseModel):
    product_id: str

class PassportGenerateResponse(BaseModel):
    qr_code_url: str
    shareable_url: str
