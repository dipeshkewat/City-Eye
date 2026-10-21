import os
import shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.models import Report, ReportStatus, UserRole, User, Camera
from app.schemas.schemas import ReportOut, ReportCreate, ReviewPayload, AssignPayload

router = APIRouter()

EVIDENCE_DIR = "uploads/evidence"
RESOLUTION_DIR = "uploads/resolution"


def _get_report_or_404(report_id: str, db: Session) -> Report:
    report = (
        db.query(Report)
        .options(joinedload(Report.camera))
        .filter(Report.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ─── List Reports ────────────────────────────────────────────────────────────
@router.get("", response_model=list[ReportOut])
def list_reports(
    status: str | None = None,
    problem_type: str | None = None,
    severity_label: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Report).options(joinedload(Report.camera))

    # Work team only sees their own assigned reports
    if current_user.role == UserRole.work_team:
        q = q.filter(Report.assigned_team == current_user.id)

    if status:
        q = q.filter(Report.status == status)
    if problem_type:
        q = q.filter(Report.problem_type == problem_type)
    if severity_label:
        q = q.filter(Report.severity_label == severity_label)

    return q.order_by(Report.created_at.desc()).all()


# ─── Get Single Report ────────────────────────────────────────────────────────
@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = _get_report_or_404(report_id, db)

    # Work team can only view their own assigned report
    if current_user.role == UserRole.work_team and report.assigned_team != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return report


# ─── ML Ingestion (no auth — called by ML pipeline) ──────────────────────────
@router.post("/ingest", response_model=ReportOut, status_code=201)
def ingest_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
):
    """
    Called by the ML pipeline (detect.py) to submit a confirmed detection.
    No JWT required — this endpoint is only reachable from localhost by design.
    """
    camera = db.query(Camera).filter(Camera.id == payload.camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail=f"Camera '{payload.camera_id}' not found")

    report = Report(**payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)

    # Re-load with camera relationship for response
    db.refresh(report)
    report = _get_report_or_404(report.id, db)
    return report


# ─── Officer: Review (Approve / Reject) ──────────────────────────────────────
@router.patch("/{report_id}/review", response_model=ReportOut)
def review_report(
    report_id: str,
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.officer)),
):
    report = _get_report_or_404(report_id, db)
    if report.status != ReportStatus.pending_officer_review:
        raise HTTPException(status_code=400, detail="Report is not pending review")

    if payload.decision == "approved":
        report.status = ReportStatus.approved
    elif payload.decision == "rejected":
        if not payload.rejection_reason:
            raise HTTPException(status_code=400, detail="rejection_reason is required when rejecting")
        report.status = ReportStatus.rejected
        report.rejection_reason = payload.rejection_reason
    else:
        raise HTTPException(status_code=400, detail="decision must be 'approved' or 'rejected'")

    report.reviewed_by = current_user.id
    report.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return _get_report_or_404(report.id, db)


# ─── Officer: Assign to Work Team ─────────────────────────────────────────────
@router.patch("/{report_id}/assign", response_model=ReportOut)
def assign_report(
    report_id: str,
    payload: AssignPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.officer)),
):
    report = _get_report_or_404(report_id, db)
    if report.status != ReportStatus.approved:
        raise HTTPException(status_code=400, detail="Report must be approved before assigning")

    crew = db.query(User).filter(
        User.id == payload.assigned_team,
        User.role == UserRole.work_team,
        User.is_active == True,
    ).first()
    if not crew:
        raise HTTPException(status_code=404, detail="Work team member not found or inactive")

    report.status = ReportStatus.assigned
    report.assigned_team = payload.assigned_team
    report.assigned_at = datetime.now(timezone.utc)
    db.commit()
    return _get_report_or_404(report.id, db)


# ─── Work Team: Start Progress ────────────────────────────────────────────────
@router.patch("/{report_id}/progress", response_model=ReportOut)
def start_progress(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.work_team)),
):
    report = _get_report_or_404(report_id, db)
    if report.assigned_team != current_user.id:
        raise HTTPException(status_code=403, detail="This report is not assigned to you")
    if report.status != ReportStatus.assigned:
        raise HTTPException(status_code=400, detail="Report must be in 'assigned' status to start progress")

    report.status = ReportStatus.in_progress
    report.in_progress_at = datetime.now(timezone.utc)
    db.commit()
    return _get_report_or_404(report.id, db)


# ─── Work Team: Resolve (with photo upload) ───────────────────────────────────
@router.patch("/{report_id}/resolve", response_model=ReportOut)
async def resolve_report(
    report_id: str,
    resolution_notes: str = Form(...),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.work_team)),
):
    report = _get_report_or_404(report_id, db)
    if report.assigned_team != current_user.id:
        raise HTTPException(status_code=403, detail="This report is not assigned to you")
    if report.status != ReportStatus.in_progress:
        raise HTTPException(status_code=400, detail="Report must be 'in_progress' to resolve")
    if not resolution_notes.strip():
        raise HTTPException(status_code=400, detail="resolution_notes cannot be empty")

    # Save resolution photo if provided
    if photo and photo.filename:
        os.makedirs(RESOLUTION_DIR, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        filename = f"{report_id}{ext}"
        filepath = os.path.join(RESOLUTION_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        report.resolution_photo_path = filepath

    report.status = ReportStatus.resolved
    report.resolution_notes = resolution_notes.strip()
    report.resolved_by = current_user.id
    report.resolved_at = datetime.now(timezone.utc)
    db.commit()
    return _get_report_or_404(report.id, db)


# ─── Officer: Upload Evidence Photo ──────────────────────────────────────────
@router.post("/{report_id}/evidence", response_model=ReportOut)
async def upload_evidence(
    report_id: str,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.officer)),
):
    """Allows officer to manually upload or replace an evidence photo."""
    report = _get_report_or_404(report_id, db)
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    ext = os.path.splitext(photo.filename)[1] or ".jpg"
    filename = f"evidence_{report_id}{ext}"
    filepath = os.path.join(EVIDENCE_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(photo.file, f)
    report.evidence_image_path = filepath
    db.commit()
    return _get_report_or_404(report.id, db)
