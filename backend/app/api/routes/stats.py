from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Report, Camera, ReportStatus, User, UserRole
from app.schemas.schemas import DashboardStats, UserOut

router = APIRouter()


# ─── Dashboard Stats (role-aware) ────────────────────────────────────────────
@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Report)

    # Work team only sees their own assigned reports
    if current_user.role == UserRole.work_team:
        q = q.filter(Report.assigned_team == current_user.id)

    reports = q.all()
    cameras = db.query(Camera).all()

    return DashboardStats(
        total=len(reports),
        pending=sum(1 for r in reports if r.status == ReportStatus.pending_officer_review),
        approved=sum(1 for r in reports if r.status == ReportStatus.approved),
        assigned=sum(1 for r in reports if r.status == ReportStatus.assigned),
        in_progress=sum(1 for r in reports if r.status == ReportStatus.in_progress),
        resolved=sum(1 for r in reports if r.status == ReportStatus.resolved),
        rejected=sum(1 for r in reports if r.status == ReportStatus.rejected),
        cameras_total=len(cameras),
        cameras_online=sum(1 for c in cameras if c.is_active),
    )


# ─── List Work Teams (for officer assign dropdown) ────────────────────────────
@router.get("/users/work-teams", response_model=list[UserOut])
def list_work_teams(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(User)
        .filter(User.role == UserRole.work_team, User.is_active == True)
        .order_by(User.name)
        .all()
    )


# ─── Current User Profile ─────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
