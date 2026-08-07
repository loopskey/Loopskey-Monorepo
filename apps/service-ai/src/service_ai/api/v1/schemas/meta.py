"""Contract identity, reported to the calling service."""

from pydantic import BaseModel, Field


class MetaResponse(BaseModel):
    """What `apps/api` reads to confirm it is talking to the build it expects."""

    service: str
    version: str = Field(description="Service release version")
    api_version: str = Field(
        alias="apiVersion",
        description="Contract version this route set implements",
    )

    model_config = {"populate_by_name": True}
