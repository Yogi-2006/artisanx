from fastapi import APIRouter
from .schemas import DashboardDataResponse
from .service import get_dashboard_data

router = APIRouter(prefix="/facilitator", tags=["facilitator"])

@router.get("/dashboard", response_model=DashboardDataResponse)
def route_get_dashboard_data() -> DashboardDataResponse:
    return get_dashboard_data()
