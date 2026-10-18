from datetime import datetime
from pydantic import BaseModel, EmailStr, computed_field
from app.models.models import UserRole, ReportStatus


# -- Auth --
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    model_config = {"from_attributes": True}

TokenResponse.model_rebuild()


# -- Camera --
class CameraCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float

class CameraOut(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# -- Detection sub-schema --
class DetectionOut(BaseModel):
    camera_id: str
    problem_type: str
    severity_label: str
    severity_score: float
    confidence: float
    confirmed_frame_count: int
    evidence_image_path: str | None


# -- Report --
class ReportOut(BaseModel):
    id: str
    camera_id: str
    title: str
    description: str
    citizen_summary: str
    recommended_department: str
    problem_type: str
    severity_label: str
    severity_score: float
    confidence: float
    confirmed_frame_count: int
    evidence_image_path: str | None
    status: ReportStatus
    reviewed_by: str | None
    reviewed_at: datetime | None
    rejection_reason: str | None
    assigned_team: str | None
    assigned_at: datetime | None
    in_progress_at: datetime | None
    resolution_photo_path: str | None
    resolution_notes: str | None
    resolved_by: str | None
    resolved_at: datetime | None
    created_at: datetime
    camera: CameraOut
    model_config = {"from_attributes": True}

    @computed_field
    @property
    def detection(self) -> DetectionOut:
        return DetectionOut(
            camera_id=self.camera_id,
            problem_type=self.problem_type,
            severity_label=self.severity_label,
            severity_score=self.severity_score,
            confidence=self.confidence,
            confirmed_frame_count=self.confirmed_frame_count,
            evidence_image_path=self.evidence_image_path,
        )


# -- Workflow payloads --
class ReviewPayload(BaseModel):
    decision: str
    rejection_reason: str | None = None

class AssignPayload(BaseModel):
    assigned_team: str

class ResolvePayload(BaseModel):
    resolution_notes: str


# -- Stats --
class DashboardStats(BaseModel):
    total: int
    pending: int
    approved: int
    in_progress: int
    resolved: int
    rejected: int
    cameras_total: int
    cameras_online: int
