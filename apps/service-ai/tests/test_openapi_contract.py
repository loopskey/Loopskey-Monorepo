"""Contract drift gate.

The committed `openapi.json` is what `apps/api` generates its TypeScript client
from. If the application and the file disagree, the generated client describes
a service that no longer exists — the same failure the `schema.gql` drift check
prevents on the frontend boundary.
"""

import json
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SERVICE_ROOT / "scripts"))

from export_openapi import CONTRACT_PATH, build_contract  # noqa: E402


def test_committed_contract_matches_application() -> None:
    assert CONTRACT_PATH.exists(), (
        "openapi.json is missing. Run: npm run codegen --workspace service-ai"
    )

    committed = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))

    assert committed == build_contract(), (
        "openapi.json is stale. Regenerate it with "
        "`npm run codegen --workspace service-ai` and commit the result."
    )


def test_contract_documents_the_versioned_surface() -> None:
    committed = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    paths = committed["paths"]

    assert "/v1/meta" in paths
    # Ops endpoints are part of the contract too: the core API's health page
    # and any orchestrator probe depend on their shape.
    assert "/health" in paths
    assert "/ready" in paths
