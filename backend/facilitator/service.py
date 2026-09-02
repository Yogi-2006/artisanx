from .schemas import DashboardDataResponse

def get_dashboard_data() -> DashboardDataResponse:
    return DashboardDataResponse(total_artisans=0, pending_reviews=0)
