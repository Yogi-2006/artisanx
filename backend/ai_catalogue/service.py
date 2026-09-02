from .schemas import AICatalogueGenerateRequest, AICatalogueGenerateResponse

def generate_catalogue(req: AICatalogueGenerateRequest) -> AICatalogueGenerateResponse:
    return AICatalogueGenerateResponse(title="T", description="D", category="C", tags=["tag"])
