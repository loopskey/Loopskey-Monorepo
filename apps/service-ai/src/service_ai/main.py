"""Application entry point.

`create_app` is a factory rather than a module-level singleton so tests can
build an app against overridden settings, and so `scripts/export_openapi.py`
can produce the contract without starting a server.
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from service_ai import __version__
from service_ai.api.router import router as api_router
from service_ai.core.config import Settings, get_settings
from service_ai.core.correlation import CorrelationIdMiddleware
from service_ai.core.errors import register_exception_handlers
from service_ai.core.logging import configure_logging

logger = logging.getLogger(__name__)

OPENAPI_TITLE = "Loopskey AI Service"
OPENAPI_DESCRIPTION = (
    "Private REST contract between apps/api and the AI service. "
    "Not a public API: it is never called from a browser. "
    "See context/architecture/adr-007-ai-service-communication.md."
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings: Settings = app.state.settings
    logger.info(
        "Starting service-ai",
        extra={"environment": settings.environment.value, "version": __version__},
    )
    yield
    logger.info("Stopping service-ai")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build the application.

    Passing `settings` is for tests and for the contract export; the running
    service uses the cached environment-derived instance.
    """
    resolved = settings or get_settings()
    configure_logging(resolved.log_level, resolved.environment)

    app = FastAPI(
        title=OPENAPI_TITLE,
        description=OPENAPI_DESCRIPTION,
        version=__version__,
        lifespan=lifespan,
        # Interactive docs are a development affordance. The service is private
        # and the contract is a committed file, so production serves neither.
        docs_url=None if resolved.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if resolved.is_production else "/openapi.json",
    )

    app.state.settings = resolved

    # Routes read configuration through `Depends(get_settings)`, which returns
    # the cached environment instance. Without this override an explicitly
    # configured app would log and document one configuration while serving
    # requests under another.
    if settings is not None:
        app.dependency_overrides[get_settings] = lambda: resolved

    app.add_middleware(CorrelationIdMiddleware)
    register_exception_handlers(app)
    app.include_router(api_router)

    return app


app = create_app()
