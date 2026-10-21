from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.models import Camera, UserRole, User
from app.schemas.schemas import CameraCreate, CameraOut

router = APIRouter()


# ─── List All Cameras ─────────────────────────────────────────────────────────
@router.get("", response_model=list[CameraOut])
def list_cameras(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.officer, UserRole.senior_officer)),
):
    return db.query(Camera).order_by(Camera.created_at.desc()).all()


# ─── Register a New Camera ────────────────────────────────────────────────────
@router.post("", response_model=CameraOut, status_code=201)
def register_camera(
    payload: CameraCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.officer)),
):
    camera = Camera(**payload.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera


# ─── Toggle Camera Active/Inactive ────────────────────────────────────────────
@router.patch("/{camera_id}/toggle", response_model=CameraOut)
def toggle_camera(
    camera_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.officer)),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera.is_active = not camera.is_active
    db.commit()
    db.refresh(camera)
    return camera


# ─── Delete a Camera ──────────────────────────────────────────────────────────
@router.delete("/{camera_id}", status_code=204)
def delete_camera(
    camera_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.officer)),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(camera)
    db.commit()
