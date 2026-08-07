"""Versioned router.

The service credential is required once, here, rather than repeated on each
route — the same reason the core API guards globally and opts out explicitly.
A new route is authenticated by default because it is mounted here.
"""

from fastapi import APIRouter, Depends, status

from service_ai.api.v1.routes import meta
from service_ai.core.errors import ErrorResponse
from service_ai.core.security import require_service_caller

router = APIRouter(
    prefix="/v1",
    dependencies=[Depends(require_service_caller)],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
)

router.include_router(meta.router)

__all__ = ["router"]
