from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Report, Camera, ReportStatus, User
from app.schemas.schemas import DashboardStats, UserOut

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Report)
    if current_user.role.value == "work_team":
        q = q.filter(Report.assigned_team == current_user.id)

    reports = q.all()
    cameras = db.query(Camera).all()

    return DashboardStats(
        total=len(reports),
        pending=sum(1 for r in reports if r.status == ReportStatus.pending_officer_review),
        approved=sum(1 for r in reports if r.status == ReportStatus.approved),
        in_progress=sum(1 for r in reports if r.status == ReportStatus.in_progress),
        resolved=sum(1 for r in reports if r.status == ReportStatus.resolved),
        rejected=sum(1 for r in reports if r.status == ReportStatus.rejected),
        cameras_total=len(cameras),
        cameras_online=sum(1 for c in cameras if c.is_active),
    )


@router.get("/users/work-teams", response_model=list[UserOut])
def list_work_teams(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.models import UserRole
    return db.query(User).filter(User.role == UserRole.work_team, User.is_active == True).all()
