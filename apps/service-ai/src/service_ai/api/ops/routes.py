"""Liveness and readiness.

Semantics match the core API: `/health` answers "is this process alive", and
`/ready` answers "can it actually do its job right now". Only the second is
allowed to fail, and orchestrators must route on it rather than on `/health`.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import JSONResponse

from service_ai import __version__
from service_ai.api.ops.schemas import (
    DependencyStatus,
    HealthResponse,
    HealthStatus,
    ReadinessResponse,
)
from service_ai.core.config import Settings, get_settings

router = APIRouter(tags=["ops"])

SERVICE_NAME = "service-ai"


@router.get("/health", response_model=HealthResponse, summary="Liveness probe")
async def health() -> HealthResponse:
    return HealthResponse(
        status=HealthStatus.OK,
        service=SERVICE_NAME,
        version=__version__,
    )


def _check_credential(settings: Settings) -> DependencyStatus:
    """A deployment that requires a credential but has none cannot serve /v1."""
    if not settings.requires_api_key:
        return DependencyStatus(
            name="service-credential",
            ready=True,
            detail="not required in development",
        )

    configured = settings.api_key is not None
    return DependencyStatus(
        name="service-credential",
        ready=configured,
        detail=None if configured else "SERVICE_AI_API_KEY is not set",
    )


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    summary="Readiness probe",
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ReadinessResponse}},
)
async def ready(
    settings: Annotated[Settings, Depends(get_settings)],
) -> Response:
    dependencies = [_check_credential(settings)]
    all_ready = all(dependency.ready for dependency in dependencies)

    body = ReadinessResponse(
        status=HealthStatus.OK if all_ready else HealthStatus.DEGRADED,
        dependencies=dependencies,
    )

    return JSONResponse(
        status_code=(
            status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE
        ),
        content=body.model_dump(mode="json"),
    )
