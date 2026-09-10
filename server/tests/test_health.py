from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app


def test_health_returns_ok_and_creates_db_file() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert get_settings().db_path.exists()
