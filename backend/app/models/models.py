from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, Integer, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum
import uuid


class UserRole(str, enum.Enum):
    officer = "officer"
    work_team = "work_team"
    senior_officer = "senior_officer"


class ReportStatus(str, enum.Enum):
    pending_officer_review = "pending_officer_review"
    approved = "approved"
    rejected = "rejected"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole))
    team_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    reviewed_reports: Mapped[list["Report"]] = relationship("Report", foreign_keys="Report.reviewed_by", back_populates="reviewer")
    assigned_reports: Mapped[list["Report"]] = relationship("Report", foreign_keys="Report.assigned_team", back_populates="assigned_crew")
    resolved_reports: Mapped[list["Report"]] = relationship("Report", foreign_keys="Report.resolved_by", back_populates="resolver")


class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    reports: Mapped[list["Report"]] = relationship("Report", back_populates="camera")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id: Mapped[str] = mapped_column(String, ForeignKey("cameras.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    citizen_summary: Mapped[str] = mapped_column(Text)
    recommended_department: Mapped[str] = mapped_column(String(100), default="Road Maintenance")

    # Detection metadata
    problem_type: Mapped[str] = mapped_column(String(50))
    severity_label: Mapped[str] = mapped_column(String(20))
    severity_score: Mapped[float] = mapped_column(Float, default=0.0)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    confirmed_frame_count: Mapped[int] = mapped_column(Integer, default=5)
    evidence_image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Workflow
    status: Mapped[ReportStatus] = mapped_column(SAEnum(ReportStatus), default=ReportStatus.pending_officer_review, index=True)
    reviewed_by: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_team: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True, index=True)
    assigned_at: Mapped[datetime | None] = mapped_column(nullable=True)
    in_progress_at: Mapped[datetime | None] = mapped_column(nullable=True)
    resolution_photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    camera: Mapped["Camera"] = relationship("Camera", back_populates="reports")
    reviewer: Mapped["User | None"] = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_reports")
    assigned_crew: Mapped["User | None"] = relationship("User", foreign_keys=[assigned_team], back_populates="assigned_reports")
    resolver: Mapped["User | None"] = relationship("User", foreign_keys=[resolved_by], back_populates="resolved_reports")
