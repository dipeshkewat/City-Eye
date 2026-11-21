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
from app.main import app as fastapi_app
from app.core.detection_engine import get_yolo_model
from PIL import Image
import numpy as np

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
        # RGB format for Gradio output
        rgb_img = Image.fromarray(annotated) if isinstance(annotated, np.ndarray) else image
        return rgb_img, summary
    except Exception as e:
        return image, f"Detection error: {str(e)}"

# Create interactive test interface for browser visitors & professors
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

# Mount Gradio onto FastAPI:
# - Root '/' displays the Gradio interactive demo
# - All '/api/v1/...' routes handle React Frontend API requests
# - '/health' and '/docs' are fully accessible
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
