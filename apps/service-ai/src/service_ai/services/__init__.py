"""Use cases.

One module per capability. A service orchestrates domain logic and calls
outward only through the protocols declared in `domain`, so a test substitutes
a fake provider instead of mocking HTTP.

Depends on `domain` and `core`. Never imports `api` or a concrete adapter.
"""
