"""Contract identity endpoint.

`apps/api` calls this on startup to verify that the service it is pointed at
implements the contract its generated client was built from. That check is
worth an authenticated round trip: the alternative is discovering a version
mismatch inside a user-facing request.
"""

from fastapi import APIRouter

from service_ai import __version__
from service_ai.api.v1.schemas.meta import MetaResponse

router = APIRouter(tags=["meta"])

API_VERSION = "v1"


@router.get(
    "/meta",
    response_model=MetaResponse,
    response_model_by_alias=True,
    summary="Report service and contract version",
)
async def read_meta() -> MetaResponse:
    return MetaResponse(
        service="service-ai",
        version=__version__,
        apiVersion=API_VERSION,
    )
