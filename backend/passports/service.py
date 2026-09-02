from .schemas import PassportGenerateRequest, PassportGenerateResponse

def generate_passport(req: PassportGenerateRequest) -> PassportGenerateResponse:
    return PassportGenerateResponse(qr_code_url="", shareable_url="")
