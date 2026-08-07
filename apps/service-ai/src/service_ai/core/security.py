"""Service-to-service authentication.

The AI service authenticates its *caller*, not an end user. Identity and
authorization for the person behind the request are resolved by `apps/api`
before it calls here; this service never re-derives permission from a
client-supplied user ID (ADR-007).
"""

import secrets
from typing import Annotated

from fastapi import Depends, Header

from service_ai.core.config import Settings, get_settings
from service_ai.core.errors import UnauthenticatedError

SERVICE_KEY_HEADER = "x-service-key"


async def require_service_caller(
    settings: Annotated[Settings, Depends(get_settings)],
    x_service_key: Annotated[str | None, Header(alias=SERVICE_KEY_HEADER)] = None,
) -> None:
    """Reject any request that does not present the shared service credential.

    Development runs without a key so the service is usable before secrets are
    provisioned. Every other environment requires one, and a deployment that
    sets `SERVICE_AI_ENVIRONMENT` without `SERVICE_AI_API_KEY` fails closed
    rather than serving unauthenticated traffic.
    """
    expected = settings.api_key

    if expected is None:
        if settings.requires_api_key:
            raise UnauthenticatedError("Service credential is not configured")
        return

    if x_service_key is None:
        raise UnauthenticatedError()

    # Constant-time: a plain `==` leaks the shared secret one byte at a time.
    if not secrets.compare_digest(x_service_key, expected.get_secret_value()):
        raise UnauthenticatedError()
