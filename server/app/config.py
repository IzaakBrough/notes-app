from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="NOTES_")

    db_path: Path = Path("data/notes.db")


@lru_cache
def get_settings() -> Settings:
    return Settings()
