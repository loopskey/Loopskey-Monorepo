"""Write the OpenAPI contract to `openapi.json`.

This is the AI-boundary equivalent of the core API emitting `schema.gql`: the
committed file is what `apps/api` generates its typed client from, and CI fails
when it drifts from the application. Run it through `npm run codegen`.

Output is sorted and newline-terminated so a regeneration produces a diff only
when the contract actually changed.
"""

from __future__ import annotations

import json
from pathlib import Path

from service_ai.core.config import Environment, Settings
from service_ai.main import create_app

CONTRACT_PATH = Path(__file__).resolve().parent.parent / "openapi.json"


def build_contract() -> dict[str, object]:
    """Generate the contract from a fixed configuration.

    Explicit settings keep the output independent of whatever happens to be in
    the developer's environment — the file must depend on the code alone.
    """
    app = create_app(Settings(environment=Environment.TEST))
    return app.openapi()


def main() -> None:
    contract = json.dumps(build_contract(), indent=2, sort_keys=True) + "\n"
    CONTRACT_PATH.write_text(contract, encoding="utf-8")
    print(f"Wrote {CONTRACT_PATH.relative_to(Path.cwd())}")


if __name__ == "__main__":
    main()
