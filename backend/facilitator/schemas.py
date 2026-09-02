from pydantic import BaseModel

class DashboardDataResponse(BaseModel):
    total_artisans: int
    pending_reviews: int
