import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.api.routes import auth, reports, cameras, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup
    Base.metadata.create_all(bind=engine)
    # Ensure upload directories exist
    os.makedirs("uploads/evidence", exist_ok=True)
    os.makedirs("uploads/resolution", exist_ok=True)
    yield


app = FastAPI(
    title="CityEye AI Monitoring API",
    version="2.0.0",
    description=(
        "Backend API for CityEye — Municipal Infrastructure Monitoring System. "
        "Handles JWT auth, report lifecycle (pending → approved → assigned → in_progress → resolved), "
        "camera management, ML pipeline ingestion, and role-based dashboards."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static file serving for uploaded photos ──────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/v1/auth",    tags=["Authentication"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(cameras.router, prefix="/api/v1/cameras", tags=["Cameras"])
app.include_router(stats.router,   prefix="/api/v1",         tags=["Dashboard & Stats"])


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "CityEye API v2"}


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to CityEye Municipal API",
        "docs": "/docs",
        "version": "2.0.0",
    }
