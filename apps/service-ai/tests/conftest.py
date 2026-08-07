"""Shared fixtures.

Settings are cached process-wide, so any test that changes the environment must
clear that cache — otherwise the first test to build the app fixes the
configuration for the whole session.
"""

from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from service_ai.core.config import Environment, Settings, get_settings
from service_ai.main import create_app

SERVICE_KEY = "test-service-key"


@pytest.fixture(autouse=True)
def _clear_settings_cache() -> Iterator[None]:
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def settings() -> Settings:
    """A configuration that requires authentication, as production does."""
    return Settings(
        environment=Environment.TEST,
        api_key=SERVICE_KEY,
    )


@pytest.fixture
def app(settings: Settings) -> FastAPI:
    # `create_app` wires explicit settings into the dependency graph itself, so
    # routes here see the test configuration rather than the environment's.
    return create_app(settings)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def authed_client(client: TestClient) -> TestClient:
    client.headers["x-service-key"] = SERVICE_KEY
    return client
