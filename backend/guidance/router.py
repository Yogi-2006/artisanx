from fastapi import APIRouter
from .schemas import GuidanceStepResponse
from .service import get_current_step

router = APIRouter(prefix="/guidance", tags=["guidance"])

@router.get("/current", response_model=GuidanceStepResponse)
def route_get_current_step() -> GuidanceStepResponse:
    return get_current_step()
