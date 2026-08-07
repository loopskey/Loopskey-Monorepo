"""Typed application configuration.

Every value is read from the environment once, validated, and cached. Nothing
in the service reads `os.environ` directly, so a missing or malformed variable
fails at startup rather than on the first request that needs it.
"""

from enum import StrEnum
from functools import lru_cache
from typing import Annotated

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    """Deployment environment. Mirrors `NODE_ENV` on the core API."""

    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"


class LogLevel(StrEnum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class Settings(BaseSettings):
    """Configuration for the AI service.

    All variables use the `SERVICE_AI_` prefix so they are unambiguous when the
    three applications share an environment file or a deployment secret store.
    """

    model_config = SettingsConfigDict(
        env_prefix="SERVICE_AI_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        frozen=True,
    )

    environment: Environment = Environment.DEVELOPMENT
    log_level: LogLevel = LogLevel.INFO

    # The service binds to a private interface. It is not a public origin and
    # deliberately configures no CORS: browsers never call it (ADR-007).
    host: str = "127.0.0.1"
    port: Annotated[int, Field(ge=1, le=65535)] = 5800

    # Shared credential presented by `apps/api` on every /v1 request. Required
    # outside development so a misconfigured deployment cannot start unguarded.
    api_key: SecretStr | None = None

    # Where the service calls back with the result of deferred work.
    core_api_url: str = "http://127.0.0.1:5700"

    # Outbound call budget. Model providers fail slowly; an unbounded client is
    # how one slow dependency turns into an exhausted worker pool.
    request_timeout_seconds: Annotated[float, Field(gt=0, le=600)] = 60.0

    @property
    def is_production(self) -> bool:
        return self.environment is Environment.PRODUCTION

    @property
    def requires_api_key(self) -> bool:
        """Authentication is mandatory everywhere except local development."""
        return self.environment is not Environment.DEVELOPMENT


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the process-wide settings, constructed on first use.

    Cached so FastAPI can use it as a dependency without re-reading the
    environment per request. Tests clear the cache via the `settings` fixture.
    """
    return Settings()
