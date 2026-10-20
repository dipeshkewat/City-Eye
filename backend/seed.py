import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import User, Camera, Report, UserRole, ReportStatus

def run_seed():
    print("Creating all tables in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if users already seeded
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Database already contains {existing_users} users. Skipping user seed.")
        else:
            print("Seeding initial users...")
            users = [
                User(
                    id="usr-001",
                    name="Ruchika",
                    email="officer@cityeye.gov",
                    password_hash=hash_password("officer123"),
                    role=UserRole.officer,
                    is_active=True,
                ),
                User(
                    id="usr-002",
                    name="Vikram Patil",
                    email="vikram@cityeye.gov",
                    password_hash=hash_password("workteam123"),
                    role=UserRole.work_team,
                    is_active=True,
                ),
                User(
                    id="usr-003",
                    name="Sunil Deshmukh",
                    email="sunil@cityeye.gov",
                    password_hash=hash_password("workteam123"),
                    role=UserRole.work_team,
                    is_active=True,
                ),
                User(
                    id="usr-004",
                    name="Dipesh Kewat",
                    email="senior@cityeye.gov",
                    password_hash=hash_password("senior123"),
                    role=UserRole.senior_officer,
                    is_active=True,
                ),
            ]
            db.add_all(users)
            db.commit()
            print("Users seeded successfully!")

        # Check if cameras already seeded
        existing_cameras = db.query(Camera).count()
        if existing_cameras > 0:
            print(f"Database already contains {existing_cameras} cameras. Skipping camera seed.")
        else:
            print("Seeding initial cameras...")
            cameras = [
                Camera(id="cam-001", name="MG Road Junction Cam", latitude=19.0760, longitude=72.8777, address="MG Road Junction, Fort, Mumbai", is_active=True),
                Camera(id="cam-002", name="Andheri Station Cam", latitude=19.1197, longitude=72.8464, address="Andheri Station Road, Andheri West, Mumbai", is_active=True),
                Camera(id="cam-003", name="Dadar TT Circle Cam", latitude=19.0178, longitude=72.8478, address="Dadar TT Circle, Dadar, Mumbai", is_active=True),
                Camera(id="cam-004", name="Bandra Linking Road Cam", latitude=19.0596, longitude=72.8295, address="Linking Road, Bandra West, Mumbai", is_active=True),
                Camera(id="cam-005", name="Worli Sea Face Cam", latitude=19.0176, longitude=72.8151, address="Worli Sea Face Road, Worli, Mumbai", is_active=True),
                Camera(id="cam-006", name="Juhu Beach Road Cam", latitude=19.0883, longitude=72.8262, address="Juhu Tara Road, Juhu, Mumbai", is_active=False),
                Camera(id="cam-007", name="Powai Lake Cam", latitude=19.1270, longitude=72.9060, address="Hiranandani Gardens, Powai, Mumbai", is_active=True),
                Camera(id="cam-008", name="Colaba Causeway Cam", latitude=18.9217, longitude=72.8314, address="Colaba Causeway, Colaba, Mumbai", is_active=True),
            ]
            db.add_all(cameras)
            db.commit()
            print("Cameras seeded successfully!")

        # Check if reports already seeded
        existing_reports = db.query(Report).count()
        if existing_reports > 0:
            print(f"Database already contains {existing_reports} reports. Skipping report seed.")
        else:
            print("Seeding initial reports...")
            now = datetime.now(timezone.utc)
            reports = [
                Report(
                    id="rpt-001",
                    camera_id="cam-001",
                    title="Large Pothole on MG Road Near Metro Station",
                    description="A significant pothole measuring approximately 1.5 meters in diameter has been detected on the main carriageway of MG Road, near the metro station exit. The pothole is in the left lane and poses a risk to two-wheeler traffic. Confirmed across 8 consecutive frames with high confidence.",
                    citizen_summary="A large pothole has been found on MG Road near the metro station. The road maintenance team has been notified and repair work will be scheduled shortly.",
                    recommended_department="Road Maintenance",
                    problem_type="pothole",
                    severity_label="high",
                    severity_score=0.87,
                    confidence=0.94,
                    confirmed_frame_count=8,
                    evidence_image_path="/evidence/det-001.jpg",
                    status=ReportStatus.pending_officer_review,
                    created_at=now - timedelta(hours=3),
                ),
                Report(
                    id="rpt-002",
                    camera_id="cam-002",
                    title="Severe Waterlogging / Blocked Drain on Station Road",
                    description="Extensive stagnant water accumulation covering two lanes of Andheri Station Road. Stormwater drain appears clogged with silt and plastic debris. Water depth estimated at 15-20cm, causing heavy vehicular congestion.",
                    citizen_summary="Waterlogging has occurred on Andheri Station Road due to a choked drain. The drainage maintenance crew has been dispatched to clear the obstruction.",
                    recommended_department="Drainage & Stormwater",
                    problem_type="waterlogging",
                    severity_label="high",
                    severity_score=0.82,
                    confidence=0.91,
                    confirmed_frame_count=7,
                    evidence_image_path="/evidence/det-002.jpg",
                    status=ReportStatus.approved,
                    reviewed_by="usr-001",
                    reviewed_at=now - timedelta(hours=2),
                    created_at=now - timedelta(hours=5),
                ),
                Report(
                    id="rpt-003",
                    camera_id="cam-003",
                    title="Overflowing Garbage Dump at Dadar Market Perimeter",
                    description="Municipal community bin is overflowing onto the pedestrian footpath. Waste spillage extends approximately 4 meters along the walkway. Organic and packaging waste is causing odor and impeding foot traffic.",
                    citizen_summary="A waste overflow has been detected at Dadar Market. The sanitation department has scheduled a prompt clearance.",
                    recommended_department="Solid Waste Management",
                    problem_type="garbage_dump",
                    severity_label="medium",
                    severity_score=0.64,
                    confidence=0.88,
                    confirmed_frame_count=6,
                    evidence_image_path="/evidence/det-003.jpg",
                    status=ReportStatus.assigned,
                    reviewed_by="usr-001",
                    reviewed_at=now - timedelta(hours=4),
                    assigned_team="usr-002",
                    assigned_at=now - timedelta(hours=3, minutes=30),
                    created_at=now - timedelta(hours=8),
                ),
                Report(
                    id="rpt-004",
                    camera_id="cam-004",
                    title="Damaged Traffic Barrier & Guard Rail on Linking Road",
                    description="A 3-meter section of metal pedestrian safety barrier is structurally compromised and bent outward toward traffic. Looks like impact from a reversing vehicle. Potential hazard for pedestrians waiting to cross.",
                    citizen_summary="A bent guard rail has been reported on Linking Road. Maintenance crew is actively on site replacing the damaged section.",
                    recommended_department="Traffic Infrastructure",
                    problem_type="broken_barrier",
                    severity_label="medium",
                    severity_score=0.58,
                    confidence=0.85,
                    confirmed_frame_count=5,
                    evidence_image_path="/evidence/det-004.jpg",
                    status=ReportStatus.in_progress,
                    reviewed_by="usr-001",
                    reviewed_at=now - timedelta(hours=6),
                    assigned_team="usr-002",
                    assigned_at=now - timedelta(hours=5),
                    in_progress_at=now - timedelta(hours=2),
                    created_at=now - timedelta(hours=12),
                ),
                Report(
                    id="rpt-005",
                    camera_id="cam-005",
                    title="Deep Pothole on Flyover Approach Ramp",
                    description="Deep pothole with exposed aggregate on the southbound approach ramp to Worli Sea Face. Surface deterioration approximately 40cm across, 7cm deep.",
                    citizen_summary="Road repair work completed successfully on the flyover ramp. The pothole has been fully filled and asphalt compacted.",
                    recommended_department="Road Maintenance",
                    problem_type="pothole",
                    severity_label="high",
                    severity_score=0.91,
                    confidence=0.96,
                    confirmed_frame_count=10,
                    evidence_image_path="/evidence/det-005.jpg",
                    status=ReportStatus.resolved,
                    reviewed_by="usr-001",
                    reviewed_at=now - timedelta(days=1, hours=4),
                    assigned_team="usr-002",
                    assigned_at=now - timedelta(days=1, hours=3),
                    in_progress_at=now - timedelta(days=1, hours=1),
                    resolution_photo_path="uploads/resolution/rpt-005.jpg",
                    resolution_notes="Cold mix asphalt patch applied, compacted with 1-ton roller. Sealed edges with bituminous emulsion. Road fully reopened to traffic.",
                    resolved_by="usr-002",
                    resolved_at=now - timedelta(hours=18),
                    created_at=now - timedelta(days=1, hours=8),
                ),
                Report(
                    id="rpt-006",
                    camera_id="cam-007",
                    title="Illegal Debris Dumping on Footpath near Hiranandani",
                    description="Construction debris and cement bags left obstructing the public sidewalk for over 24 hours.",
                    citizen_summary="Incident reviewed and rejected as duplicate notification under active municipal permit #44821.",
                    recommended_department="Enforcement & Vigilance",
                    problem_type="debris",
                    severity_label="low",
                    severity_score=0.35,
                    confidence=0.79,
                    confirmed_frame_count=5,
                    evidence_image_path="/evidence/det-006.jpg",
                    status=ReportStatus.rejected,
                    reviewed_by="usr-001",
                    reviewed_at=now - timedelta(hours=10),
                    rejection_reason="Duplicate: Ongoing permitted utility trenching under Ward permit #44821.",
                    created_at=now - timedelta(hours=14),
                )
            ]
            db.add_all(reports)
            db.commit()
            print("Reports seeded successfully!")

        print("\n=== Database seeding complete! ===")
        print("Demo Credentials:")
        print("  Officer:         officer@cityeye.gov / officer123")
        print("  Work Team 1:     vikram@cityeye.gov / workteam123")
        print("  Work Team 2:     sunil@cityeye.gov / workteam123")
        print("  Senior Officer:  senior@cityeye.gov / senior123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
