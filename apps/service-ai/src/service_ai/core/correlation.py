"""Request correlation.

`apps/api` stamps every request with `x-correlation-id`. The AI service adopts
that value rather than minting its own, so one browser action produces one
traceable identifier across all three applications.
"""

from collections.abc import Awaitable, Callable
from contextvars import ContextVar
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

CORRELATION_ID_HEADER = "x-correlation-id"

_correlation_id: ContextVar[str | None] = ContextVar("correlation_id", default=None)


def get_correlation_id() -> str | None:
    """Return the correlation ID bound to the current request, if any."""
    return _correlation_id.get()


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Bind an inbound correlation ID for the lifetime of the request.

    A caller that omits the header gets a generated one; either way the value
    is echoed on the response so the core API can log what it received back.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        correlation_id = request.headers.get(CORRELATION_ID_HEADER) or str(uuid4())
        token = _correlation_id.set(correlation_id)
        try:
            response = await call_next(request)
        finally:
            _correlation_id.reset(token)

        response.headers[CORRELATION_ID_HEADER] = correlation_id
        return response
