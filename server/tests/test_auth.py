from fastapi.testclient import TestClient

from app.main import app


def test_setup_succeeds_once_and_conflicts_on_second_call() -> None:
    with TestClient(app) as client:
        first = client.post("/setup", json={"password": "correct-horse-battery-staple"})
        second = client.post("/setup", json={"password": "another-password"})

    assert first.status_code == 201
    assert second.status_code == 409


def test_unlock_with_correct_password_returns_token() -> None:
    with TestClient(app) as client:
        client.post("/setup", json={"password": "correct-horse-battery-staple"})
        response = client.post("/unlock", json={"password": "correct-horse-battery-staple"})

    assert response.status_code == 200
    assert isinstance(response.json()["token"], str)
    assert response.json()["token"]


def test_unlock_with_wrong_password_returns_401() -> None:
    with TestClient(app) as client:
        client.post("/setup", json={"password": "correct-horse-battery-staple"})
        response = client.post("/unlock", json={"password": "wrong-password"})

    assert response.status_code == 401


def test_protected_route_without_token_returns_401() -> None:
    with TestClient(app) as client:
        response = client.get("/session")

    assert response.status_code == 401


def test_protected_route_with_valid_token_returns_200() -> None:
    with TestClient(app) as client:
        client.post("/setup", json={"password": "correct-horse-battery-staple"})
        unlock_response = client.post("/unlock", json={"password": "correct-horse-battery-staple"})
        token = unlock_response.json()["token"]
        response = client.get("/session", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {"active": True}
