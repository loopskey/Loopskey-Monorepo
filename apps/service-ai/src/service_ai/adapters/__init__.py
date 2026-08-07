"""Concrete implementations of the domain protocols.

Model providers, vector stores, and the client that calls back into
`apps/api` when deferred work completes. Adapters own retries, timeouts and
the translation of provider failures into `service_ai.core.errors` — a raw
provider exception must never reach a route.

Depends on `domain` and `core`. Never imports `api` or `services`.
"""
