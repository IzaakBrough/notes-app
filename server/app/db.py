import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager

from app.config import get_settings


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    settings = get_settings()
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.db_path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection():
        pass
