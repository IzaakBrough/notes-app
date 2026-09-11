from collections.abc import Iterator
from pathlib import Path

import pytest

from app.config import get_settings


@pytest.fixture(autouse=True)
def isolated_settings(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("NOTES_DB_PATH", str(tmp_path / "notes.db"))
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
