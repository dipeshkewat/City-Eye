from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, computed_field
from app.models.models import UserRole, ReportStatus


# ─────────────────────────────────────────
# Auth
# ─────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    team_name: Optional[str] = None
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


TokenResponse.model_rebuild()


# ─────────────────────────────────────────
# Camera
# ─────────────────────────────────────────
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


# ─────────────────────────────────────────
# Detection sub-schema (embedded in ReportOut)
# ─────────────────────────────────────────
class DetectionOut(BaseModel):
    camera_id: str
    problem_type: str
    severity_label: str
    severity_score: float
    confidence: float
    confirmed_frame_count: int
    evidence_image_path: Optional[str] = None


# ─────────────────────────────────────────
# Report
# ─────────────────────────────────────────
class ReportCreate(BaseModel):
    """Used by the ML pipeline to ingest a confirmed detection."""
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
    evidence_image_path: Optional[str] = None


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
    evidence_image_path: Optional[str] = None
    status: ReportStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    assigned_team: Optional[str] = None
    assigned_at: Optional[datetime] = None
    in_progress_at: Optional[datetime] = None
    resolution_photo_path: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
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


# ─────────────────────────────────────────
# Workflow payloads
# ─────────────────────────────────────────
class ReviewPayload(BaseModel):
    decision: str  # "approved" | "rejected"
    rejection_reason: Optional[str] = None


class AssignPayload(BaseModel):
    assigned_team: str  # user id of work_team member


class ResolvePayload(BaseModel):
    resolution_notes: str


# ─────────────────────────────────────────
# Stats
# ─────────────────────────────────────────
class DashboardStats(BaseModel):
    total: int
    pending: int
    approved: int
    assigned: int
    in_progress: int
    resolved: int
    rejected: int
    cameras_total: int
    cameras_online: int
