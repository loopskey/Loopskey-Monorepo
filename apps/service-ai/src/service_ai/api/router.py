"""Top-level route table.

Two surfaces with deliberately different rules:

- `ops` is unauthenticated and unversioned, because a load balancer probing
  liveness has no credential and must never be broken by an API version bump;
- `v1` is authenticated and versioned, and is the surface the committed
  `openapi.json` contract describes.
"""

from fastapi import APIRouter

from service_ai.api.ops.routes import router as ops_router
from service_ai.api.v1.router import router as v1_router

router = APIRouter()
router.include_router(ops_router)
router.include_router(v1_router)

__all__ = ["router"]
