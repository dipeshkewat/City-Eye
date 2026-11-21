from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
import cv2
import time
from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.models import Camera, UserRole
from app.schemas.schemas import CameraCreate, CameraOut

router = APIRouter()

# In-memory buffer for real-time mobile camera streaming
_LATEST_STREAM_FRAME: bytes | None = None


def _generate_webcam_frames():
    """Generates MJPEG stream from hardware camera via OpenCV (Windows DirectShow)."""
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.05)
                continue
            ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if not ret:
                continue
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
            time.sleep(0.033)  # ~30 FPS
    finally:
        cap.release()


@router.get("/webcam-stream")
def webcam_stream():
    """Direct hardware camera stream. Bypasses browser getUserMedia permissions and device lock errors."""
    return StreamingResponse(
        _generate_webcam_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("", response_model=list[CameraOut])
def list_cameras(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.officer, UserRole.senior_officer))
):
    return db.query(Camera).order_by(Camera.created_at.desc()).all()


@router.post("", response_model=CameraOut, status_code=201)
def register_camera(
    payload: CameraCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.officer))
):
    camera = Camera(**payload.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera


@router.post("/stream-frame")
async def upload_stream_frame(file: UploadFile = File(...)):
    """Receives live video frames from phone browser for zero-install mobile CCTV."""
    global _LATEST_STREAM_FRAME
    content = await file.read()
    _LATEST_STREAM_FRAME = content
    return {"status": "ok", "size": len(content)}


@router.get("/stream-frame")
async def get_stream_frame():
    """Serves the latest live video frame to the Officer Dashboard."""
    global _LATEST_STREAM_FRAME
    if _LATEST_STREAM_FRAME is None:
        raise HTTPException(status_code=404, detail="No live mobile stream frame available")
    return Response(
        content=_LATEST_STREAM_FRAME,
        media_type="image/jpeg",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

