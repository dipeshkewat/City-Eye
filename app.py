import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import gradio as gr
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np

# Import backend components
from app.core.database import Base, engine
from app.api.routes import auth, reports, cameras, stats
from app.core.detection_engine import get_yolo_model

# Ensure upload media directories exist
os.makedirs('uploads/evidence', exist_ok=True)
os.makedirs('uploads/resolution', exist_ok=True)

# Ensure database tables are created on startup
try:
    print("[*] Initializing PostgreSQL database tables...")
    Base.metadata.create_all(bind=engine)
    try:
        from seed import run_seed
        run_seed()
    except Exception as e:
        print(f"[*] Seed status: {e}")
except Exception as db_err:
    print(f"[!] Warning DB init: {db_err}")


def detect_defects_demo(image):
    if image is None:
        return None, "Please upload an image."
    try:
        model = get_yolo_model()
        if model is None:
            return image, "YOLOv8 Model could not be loaded."
        
        # Run inference
        results = model(image, conf=0.10)
        annotated = results[0].plot()
        
        defect_counts = {}
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            name = model.names.get(cls_id, "defect")
            defect_counts[name] = defect_counts.get(name, 0) + 1
            
        summary = f"Detected Objects: {defect_counts}" if defect_counts else "No defects detected in this frame."
        rgb_img = Image.fromarray(annotated) if isinstance(annotated, np.ndarray) else image
        return rgb_img, summary
    except Exception as e:
        return image, f"Detection error: {str(e)}"


# Create Gradio UI for Hugging Face Spaces
demo = gr.Interface(
    fn=detect_defects_demo,
    inputs=gr.Image(type="pil", label="Upload Road / CCTV Media"),
    outputs=[
        gr.Image(type="pil", label="YOLOv8 Annotated Detection"),
        gr.Textbox(label="AI Analysis Summary")
    ],
    title="CityEye AI Municipal Surveillance API & Inference Engine",
    description="High-Speed YOLOv8 Road Defect Detection (Potholes, Illegal Garbage Dumps, Waterlogging). Serves REST API for CityEye React Portal.",
)

# Enable CORS on demo.app for CityEye Frontend
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
demo.app.mount('/uploads', StaticFiles(directory='uploads'), name='uploads')

# Include all CityEye FastAPI routes into demo.app
demo.app.include_router(auth.router, prefix='/api/v1/auth', tags=['Authentication'])
demo.app.include_router(reports.router, prefix='/api/v1/reports', tags=['Reports'])
demo.app.include_router(cameras.router, prefix='/api/v1/cameras', tags=['Cameras'])
demo.app.include_router(stats.router, prefix='/api/v1', tags=['Dashboard & Stats'])

@demo.app.get('/health')
@demo.app.get('/api/v1/health')
def health_check():
    return {
        'status': 'ok',
        'service': 'CityEye AI Municipal Surveillance API',
        'version': '1.0.0'
    }

# Native Hugging Face launch without manual port collisions
if __name__ == "__main__":
    demo.launch()
