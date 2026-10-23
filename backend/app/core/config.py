import os
from pydantic_settings import BaseSettings, SettingsConfigDict

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/cityeye"
    DATABASE_URL_UNPOOLED: str | None = None
    NEON_BRANCH: str | None = None
    SECRET_KEY: str = "cityeye-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    model_config = SettingsConfigDict(
        extra="ignore",
        env_file=(
            os.path.join(backend_dir, ".env"),
            os.path.join(root_dir, ".env.local"),
            os.path.join(root_dir, ".env"),
        ),
        env_file_encoding="utf-8"
    )

settings = Settings()
