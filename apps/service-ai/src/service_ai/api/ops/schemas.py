"""Response models for the operational endpoints."""

from enum import StrEnum

from pydantic import BaseModel, Field


class HealthStatus(StrEnum):
    OK = "ok"
    DEGRADED = "degraded"


class HealthResponse(BaseModel):
    """Liveness. True whenever the process can serve a request at all."""

    status: HealthStatus
    service: str
    version: str


class DependencyStatus(BaseModel):
    name: str
    ready: bool
    detail: str | None = None


class ReadinessResponse(BaseModel):
    """Readiness. False while a required dependency is unusable."""

    status: HealthStatus
    dependencies: list[DependencyStatus] = Field(default_factory=list)
