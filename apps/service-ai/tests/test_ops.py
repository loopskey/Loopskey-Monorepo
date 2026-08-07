"""Liveness and readiness behaviour."""

from fastapi.testclient import TestClient

from service_ai.core.config import Environment, Settings
from service_ai.core.correlation import CORRELATION_ID_HEADER
from service_ai.main import create_app


def test_health_is_public(client: TestClient) -> None:
    """A probe has no credential; requiring one would fail every deployment."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ready_reports_ok_when_configured(client: TestClient) -> None:
    response = client.get("/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert all(dependency["ready"] for dependency in body["dependencies"])


def test_ready_fails_closed_without_required_credential() -> None:
    """A non-development deployment missing its key must not report ready."""
    app = create_app(Settings(environment=Environment.PRODUCTION, api_key=None))

    with TestClient(app) as client:
        response = client.get("/ready")

    assert response.status_code == 503
    assert response.json()["status"] == "degraded"


def test_correlation_id_is_echoed(client: TestClient) -> None:
    response = client.get("/health", headers={CORRELATION_ID_HEADER: "abc-123"})

    assert response.headers[CORRELATION_ID_HEADER] == "abc-123"


def test_correlation_id_is_generated_when_absent(client: TestClient) -> None:
    response = client.get("/health")

    assert response.headers[CORRELATION_ID_HEADER]
