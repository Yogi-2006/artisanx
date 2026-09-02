from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.router import router as auth_router
from artisans.router import router as artisans_router
from products.router import router as products_router
from images.router import router as images_router
from voice.router import router as voice_router
from ai_catalogue.router import router as ai_catalogue_router
from pricing.router import router as pricing_router
from passports.router import router as passports_router
from enquiries.router import router as enquiries_router
from facilitator.router import router as facilitator_router
from guidance.router import router as guidance_router
from notifications.router import router as notifications_router

app = FastAPI(title="ArtisanX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(artisans_router)
app.include_router(products_router)
app.include_router(images_router)
app.include_router(voice_router)
app.include_router(ai_catalogue_router)
app.include_router(pricing_router)
app.include_router(passports_router)
app.include_router(enquiries_router)
app.include_router(facilitator_router)
app.include_router(guidance_router)
app.include_router(notifications_router)

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
