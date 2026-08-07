"""Structured logging.

Production logs are single-line JSON carrying the correlation ID, matching the
core API's format so all three applications can be read in one stream. Keys
whose name suggests a credential are redacted rather than logged, per
`context/coding-standards.md`.
"""

import json
import logging
import sys
from typing import Final

from service_ai.core.config import Environment, LogLevel
from service_ai.core.correlation import get_correlation_id

# Substring match, lowercased. Mirrors the redaction list the core API applies.
_REDACTED_KEY_PARTS: Final[tuple[str, ...]] = (
    "password",
    "secret",
    "token",
    "authorization",
    "cookie",
    "api_key",
    "apikey",
)

_REDACTED = "[redacted]"

# Attributes LogRecord always carries; anything else was added by the caller
# via `extra=` and belongs in the structured payload.
_STANDARD_RECORD_FIELDS: Final[frozenset[str]] = frozenset(
    logging.LogRecord("", 0, "", 0, "", None, None).__dict__
) | {"message", "asctime", "taskName"}


def _is_sensitive(key: str) -> bool:
    lowered = key.lower()
    return any(part in lowered for part in _REDACTED_KEY_PARTS)


class JsonFormatter(logging.Formatter):
    """Render a log record as one line of JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
        }

        correlation_id = get_correlation_id()
        if correlation_id is not None:
            payload["correlationId"] = correlation_id

        for key, value in record.__dict__.items():
            if key in _STANDARD_RECORD_FIELDS:
                continue
            payload[key] = _REDACTED if _is_sensitive(key) else value

        if record.exc_info is not None:
            payload["error"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def configure_logging(level: LogLevel, environment: Environment) -> None:
    """Install the root log handler.

    Development keeps the readable one-line format; every other environment
    emits JSON. Existing handlers are replaced so uvicorn's defaults do not
    produce a second, differently formatted copy of each line.
    """
    formatter: logging.Formatter
    if environment is Environment.DEVELOPMENT:
        formatter = logging.Formatter("%(levelname)-8s %(name)s  %(message)s")
    else:
        formatter = JsonFormatter()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level.value)

    for uvicorn_logger in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        logger = logging.getLogger(uvicorn_logger)
        logger.handlers = []
        logger.propagate = True
