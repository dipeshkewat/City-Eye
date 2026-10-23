import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.api.routes import auth, reports, cameras, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs('uploads/evidence', exist_ok=True)
    os.makedirs('uploads/resolution', exist_ok=True)
    yield

app = FastAPI(
    title='CityEye AI Monitoring API',
    version='1.0.0',
    description='Backend API for CityEye - Municipal Infrastructure Monitoring System',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
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
def health_check():
    return {'status': 'ok', 'service': 'CityEye API'}

@app.get('/', tags=['Health'])
def root():
    return {'message': 'Welcome to CityEye Municipal API', 'docs': '/docs'}
