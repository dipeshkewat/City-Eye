import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.api.routes import auth, reports, cameras, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure media directories exist
    os.makedirs('uploads/evidence', exist_ok=True)
    os.makedirs('uploads/resolution', exist_ok=True)

    # Ensure database schema is created and seeded on startup
    try:
        print("[*] Initializing PostgreSQL database tables...")
        Base.metadata.create_all(bind=engine)
        try:
            from seed import run_seed
            run_seed()
        except Exception as seed_err:
            print(f"[*] Database seed status: {seed_err}")
    except Exception as db_err:
        print(f"[!] Warning during DB startup initialization: {db_err}")

    yield

app = FastAPI(
    title='CityEye AI Monitoring API',
    version='1.0.0',
    description='Backend API for CityEye - Municipal Infrastructure Monitoring System',
    lifespan=lifespan
)

# CORS configuration: allow all for development, configurable via CORS_ORIGINS
cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else None,
    allow_origin_regex=r".*" if origins == ["*"] else None,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

os.makedirs('uploads', exist_ok=True)
app.mount('/uploads', StaticFiles(directory='uploads'), name='uploads')

app.include_router(auth.router, prefix='/api/v1/auth', tags=['Authentication'])
app.include_router(reports.router, prefix='/api/v1/reports', tags=['Reports'])
app.include_router(cameras.router, prefix='/api/v1/cameras', tags=['Cameras'])
app.include_router(stats.router, prefix='/api/v1', tags=['Dashboard & Stats'])

@app.get('/health', tags=['Health'])
@app.get('/api/v1/health', tags=['Health'])
def health_check():
    return {
        'status': 'ok',
        'service': 'CityEye AI Municipal Surveillance API',
        'version': '1.0.0'
    }

@app.get('/', tags=['Health'])
def root():
    return {
        'service': 'CityEye Municipal Infrastructure API',
        'docs': '/docs',
        'status': 'online'
    }
