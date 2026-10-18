import os, shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.models import Report, ReportStatus, UserRole, User
from app.schemas.schemas import ReportOut, ReviewPayload, AssignPayload, ResolvePayload

router = APIRouter()

UPLOAD_DIR = "uploads/resolution"


def _get_report_or_404(report_id: str, db: Session) -> Report:
    report = db.query(Report).options(joinedload(Report.camera)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("", response_model=list[ReportOut])
def list_reports(
    status: str | None = None,
    problem_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Report).options(joinedload(Report.camera))

    # Work team only sees their own assigned reports
    if current_user.role == UserRole.work_team:
        q = q.filter(Report.assigned_team == current_user.id)

    if status:
        q = q.filter(Report.status == status)
    if problem_type:
        q = q.filter(Report.problem_type == problem_type)

    return q.order_by(Report.created_at.desc()).all()


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = _get_report_or_404(report_id, db)

    # Work team can only view their own assigned report
    if current_user.role == UserRole.work_team and report.assigned_team != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return report


@router.patch("/{report_id}/review", response_model=ReportOut)
def review_report(
    report_id: str,
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.officer))
):
    report = _get_report_or_404(report_id, db)
    if report.status != ReportStatus.pending_officer_review:
        raise HTTPException(status_code=400, detail="Report is not pending review")

    if payload.decision == "approved":
        report.status = ReportStatus.approved
    elif payload.decision == "rejected":
        if not payload.rejection_reason:
            raise HTTPException(status_code=400, detail="rejection_reason is required")
        report.status = ReportStatus.rejected
        report.rejection_reason = payload.rejection_reason
    else:
        raise HTTPException(status_code=400, detail="decision must be 'approved' or 'rejected'")

    report.reviewed_by = current_user.id
    report.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


@router.patch("/{report_id}/assign", response_model=ReportOut)
def assign_report(
    report_id: str,
    payload: AssignPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.officer))
):
    report = _get_report_or_404(report_id, db)
    if report.status != ReportStatus.approved:
        raise HTTPException(status_code=400, detail="Report must be approved before assigning")

    crew = db.query(User).filter(User.id == payload.assigned_team, User.role == UserRole.work_team).first()
    if not crew:
        raise HTTPException(status_code=404, detail="Work team member not found")

    report.status = ReportStatus.assigned
    report.assigned_team = payload.assigned_team
    report.assigned_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


@router.patch("/{report_id}/progress", response_model=ReportOut)
def start_progress(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.work_team))
):
    report = _get_report_or_404(report_id, db)
    if report.assigned_team != current_user.id:
        raise HTTPException(status_code=403, detail="This report is not assigned to you")
    if report.status != ReportStatus.assigned:
        raise HTTPException(status_code=400, detail="Report must be in assigned status")

    report.status = ReportStatus.in_progress
    report.in_progress_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


@router.patch("/{report_id}/resolve", response_model=ReportOut)
async def resolve_report(
    report_id: str,
    resolution_notes: str = Form(...),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.work_team))
):
    report = _get_report_or_404(report_id, db)
    if report.assigned_team != current_user.id:
        raise HTTPException(status_code=403, detail="This report is not assigned to you")
    if report.status != ReportStatus.in_progress:
        raise HTTPException(status_code=400, detail="Report must be in_progress to resolve")

    # Save uploaded photo if provided
    if photo and photo.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        filename = f"{report_id}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        report.resolution_photo_path = filepath
    elif not report.resolution_photo_path:
        report.resolution_photo_path = "uploads/resolution/default_resolved.jpg"

    report.status = ReportStatus.resolved
    report.resolution_notes = resolution_notes
    report.resolved_by = current_user.id
    report.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report
