from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.models import Camera, UserRole
from app.schemas.schemas import CameraCreate, CameraOut

router = APIRouter()


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
