"""Error vocabulary and the single error envelope every failure returns.

The code is the wire contract, exactly as message codes are on the core API:
`apps/api` branches on it. Add a new member rather than changing an existing
value. The human-readable message is for operators and may change freely.
"""

import logging
from enum import StrEnum
from typing import Self

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from service_ai.core.correlation import get_correlation_id

logger = logging.getLogger(__name__)


class ErrorCode(StrEnum):
    """Stable failure vocabulary shared with `apps/api`."""

    INVALID_REQUEST = "InvalidRequest"
    UNAUTHENTICATED = "Unauthenticated"
    NOT_FOUND = "NotFound"
    UPSTREAM_TIMEOUT = "UpstreamTimeout"
    UPSTREAM_UNAVAILABLE = "UpstreamUnavailable"
    INTERNAL_ERROR = "InternalError"


class ErrorBody(BaseModel):
    code: ErrorCode
    message: str
    correlation_id: str | None = Field(default=None, alias="correlationId")

    model_config = {"populate_by_name": True}


class ErrorResponse(BaseModel):
    """The only failure shape this service returns."""

    error: ErrorBody

    @classmethod
    def of(cls, code: ErrorCode, message: str) -> Self:
        return cls(
            error=ErrorBody(
                code=code,
                message=message,
                correlationId=get_correlation_id(),
            )
        )


class ServiceAiError(Exception):
    """Base class for failures that map to a known response.

    Anything not derived from this is a bug and becomes a redacted 500.
    """

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.http_status = http_status


class UnauthenticatedError(ServiceAiError):
    def __init__(self, message: str = "Missing or invalid service credential") -> None:
        super().__init__(
            ErrorCode.UNAUTHENTICATED, message, status.HTTP_401_UNAUTHORIZED
        )


class UpstreamTimeoutError(ServiceAiError):
    def __init__(self, message: str = "Upstream provider timed out") -> None:
        super().__init__(
            ErrorCode.UPSTREAM_TIMEOUT, message, status.HTTP_504_GATEWAY_TIMEOUT
        )


class UpstreamUnavailableError(ServiceAiError):
    def __init__(self, message: str = "Upstream provider is unavailable") -> None:
        super().__init__(
            ErrorCode.UPSTREAM_UNAVAILABLE, message, status.HTTP_502_BAD_GATEWAY
        )


def _render(code: ErrorCode, message: str, http_status: int) -> JSONResponse:
    body = ErrorResponse.of(code, message)
    return JSONResponse(
        status_code=http_status,
        content=body.model_dump(mode="json", by_alias=True),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Route every failure through the one envelope."""

    @app.exception_handler(ServiceAiError)
    async def _handle_known(_: Request, exc: ServiceAiError) -> JSONResponse:
        return _render(exc.code, exc.message, exc.http_status)

    @app.exception_handler(RequestValidationError)
    async def _handle_validation(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Field detail is safe here: the caller is `apps/api`, not a browser,
        # and it needs to know which field of its own request was rejected.
        return _render(
            ErrorCode.INVALID_REQUEST,
            f"Request validation failed: {exc.errors()}",
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    @app.exception_handler(Exception)
    async def _handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        # Log the cause, return none of it. Stack traces, provider payloads and
        # connection strings must not cross the boundary.
        logger.exception(
            "Unhandled error",
            extra={"path": request.url.path, "kind": type(exc).__name__},
        )
        return _render(
            ErrorCode.INTERNAL_ERROR,
            "Internal server error",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
