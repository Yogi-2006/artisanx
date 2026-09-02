from fastapi import APIRouter
from .schemas import EnquiryCreate
from .service import create_enquiry, get_enquiry

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

@router.post("/")
def route_create_enquiry(req: EnquiryCreate) -> dict:
    return create_enquiry(req)

@router.get("/{enquiry_id}")
def route_get_enquiry(enquiry_id: str) -> dict:
    return get_enquiry(enquiry_id)
