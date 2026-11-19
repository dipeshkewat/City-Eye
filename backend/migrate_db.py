import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from sqlalchemy import text

def migrate():
    print("[*] Connecting to database to apply schema updates...")
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE reports ADD COLUMN IF NOT EXISTS generation_source VARCHAR(50) DEFAULT 'template_fallback'"))
        conn.commit()
    print("[+] Database migration successful: generation_source column is verified!")

if __name__ == "__main__":
    migrate()
