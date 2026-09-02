from .schemas import EnquiryCreate

def create_enquiry(req: EnquiryCreate) -> dict:
    return {"id": "enquiry_id"}

def get_enquiry(enquiry_id: str) -> dict:
    return {"id": enquiry_id}
