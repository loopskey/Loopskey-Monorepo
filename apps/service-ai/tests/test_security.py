"""Service-to-service authentication.

These are the negative tests the boundary needs: a guard that is never observed
to reject is not known to work (`context/coding-standards.md`).
"""

from fastapi.testclient import TestClient

from service_ai.core.config import Environment, Settings
from service_ai.main import create_app


def test_v1_rejects_missing_credential(client: TestClient) -> None:
    response = client.get("/v1/meta")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "Unauthenticated"


def test_v1_rejects_wrong_credential(client: TestClient) -> None:
    response = client.get("/v1/meta", headers={"x-service-key": "not-the-key"})

    assert response.status_code == 401


def test_v1_accepts_correct_credential(authed_client: TestClient) -> None:
    response = authed_client.get("/v1/meta")

    assert response.status_code == 200
    assert response.json() == {
        "service": "service-ai",
        "version": "0.0.1",
        "apiVersion": "v1",
    }


def test_v1_fails_closed_when_credential_is_unconfigured() -> None:
    """Requiring a key but having none must reject, not wave requests through."""
    app = create_app(Settings(environment=Environment.PRODUCTION, api_key=None))

    with TestClient(app) as client:
        response = client.get("/v1/meta")

    assert response.status_code == 401


def test_development_allows_unauthenticated_calls() -> None:
    app = create_app(Settings(environment=Environment.DEVELOPMENT, api_key=None))

    with TestClient(app) as client:
        response = client.get("/v1/meta")

    assert response.status_code == 200


def test_error_envelope_carries_correlation_id(client: TestClient) -> None:
    response = client.get("/v1/meta", headers={"x-correlation-id": "trace-9"})

    assert response.json()["error"]["correlationId"] == "trace-9"
