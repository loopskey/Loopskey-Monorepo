"""Framework-free domain model.

Dataclasses, value objects and the `Protocol` definitions that describe what
the service needs from the outside world (a model provider, a vector store, the
core API). Nothing here may import FastAPI, httpx or a provider SDK — the same
rule `packages/*` follows on the TypeScript side, and for the same reason: it
is what keeps this layer testable without a network.

Depended on by `services` and `adapters`. Depends on nothing.
"""
