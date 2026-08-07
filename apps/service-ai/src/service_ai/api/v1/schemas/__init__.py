"""Pydantic request and response models.

These are the contract. FastAPI derives `openapi.json` from them, and
`apps/api` derives its TypeScript client from that file, so a field rename here
propagates to a compile error there rather than to a runtime surprise.
"""
