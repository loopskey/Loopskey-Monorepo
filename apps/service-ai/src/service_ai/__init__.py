"""Loopskey AI service.

A private FastAPI application. It is never reachable from the browser: every
request arrives from `apps/api`, which owns authentication and authorization.
See `context/architecture/adr-007-ai-service-communication.md`.
"""

__all__ = ["__version__"]

__version__ = "0.0.1"
