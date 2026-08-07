"""Version 1 of the private REST contract.

Everything under this package is described by the committed `openapi.json` and
is consumed by generated TypeScript in `apps/api`. A breaking change to a
route or schema here is a breaking change to that client: add `v2` rather than
reshaping a released `v1` response.
"""
