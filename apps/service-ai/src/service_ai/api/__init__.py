"""HTTP transport.

Routes translate the transport, apply the auth dependency and delegate. They
hold no business rules — the same boundary the core API keeps between resolvers
and services (`context/coding-standards.md`).
"""
