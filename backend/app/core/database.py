import os
import re
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

db_url = settings.DATABASE_URL
if "channel_binding=" in db_url:
    db_url = re.sub(r'[?&]channel_binding=[^&]+', '', db_url)
    if '?' not in db_url and '&' in db_url:
        db_url = db_url.replace('&', '?', 1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = None
SessionLocal = None

# Try PostgreSQL first; if unreachable (e.g. Neon scale-to-zero / network firewall), fall back to SQLite
try:
    if db_url.startswith("sqlite"):
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        test_engine = create_engine(db_url, pool_pre_ping=True, pool_recycle=300, connect_args={"connect_timeout": 3})
        # Test connection immediately
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        engine = test_engine
        print("[*] Successfully connected to remote PostgreSQL database.")
except Exception as e:
    print(f"[!] PostgreSQL unreachable ({e}). Activating high-speed resilient local SQLite database...")
    local_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "cityeye_local.db"))
    engine = create_engine(f"sqlite:///{local_db_path}", connect_args={"check_same_thread": False})
    print(f"[*] Local SQLite database active at: {local_db_path}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
