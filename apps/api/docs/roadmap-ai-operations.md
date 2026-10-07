# Roadmap AI operations

How `apps/api` talks to the Roadmap AI Service, what it retries, and what an
operator has to configure. The contract it builds against is
`contracts/roadmap-ai/roadmap-openapi.json` (see the README beside it for the
version in force). The service is stateless: the API owns the draft, the
transcript, candidate retrieval and persistence.

## Flow

```text
startRoadmapDraft / resetRoadmapDraft
  → empty draft → chat-turn (draft = {}, history = [], user_message = null)
sendRoadmapChatTurn (free text or a serialised widget answer)
  → chat-turn (history = the previous 12 messages, user_message = this one)
  → strict merge → suggested_next_step → is_complete + readiness guard
requestRoadmapGeneration (READY → GENERATING, one outbox event)
  → OutboxProcessor → generation handler → generate (1..50 backend candidates)
  → strict verification → one transaction → COMPLETED
```

## Retry policy

The provider's `retryable` flag decides. A code never overrides it, and a code
the platform has never seen is handled by `retryable` and the HTTP status alone.

| retryable | Provider outcome | Chat turn | Generation |
| --- | --- | --- | --- |
| `true` | capacity (`OVERLOADED`, `AT_CAPACITY`, …) | 429 with the advertised wait | deferred by `Retry-After` (default 30 s) |
| `true` | truncation | 503 | one retry with fewer candidates, then outbox backoff |
| `true` | any other code, timeout, 5xx | 503 | deferred by `Retry-After` when sent, else outbox backoff (2ⁿ s, max 1 h, 10 attempts) |
| `false` | any code except a refusal | 503, no automatic retry | draft `FAILED`, never re-queued |
| any | refusal (`OFF_TOPIC`, …) | recorded as a refusal | draft `FAILED` |
| — | API not configured | 503 at once | draft `FAILED` at once, never re-queued |

`Retry-After` accepts seconds or an HTTP date and is capped at one hour.

## Error handling

The provider's `message` is never copied into a client response or a log line.
Clients receive `ROADMAP_AI_UNAVAILABLE`, `ROADMAP_AI_BUSY`, `ROADMAP_AI_FAILED`
or `ROADMAP_AI_REFUSED`. A contract-invalid roadmap fails the draft with a
`RoadmapGenerationViolation` that the UI shows as an invalid generated roadmap.

## Timeouts

| Setting | Default | Must exceed | Provider budget |
| --- | --- | --- | --- |
| `ROADMAP_AI_CHAT_TURN_TIMEOUT_MS` | 35000 | 30000 | 30 s |
| `ROADMAP_AI_GENERATE_TIMEOUT_MS` | 150000 | 142000 | 70 s per call, one repair call possible (about 142 s worst case) |
| `OUTBOX_LEASE_MS` | 180000 | the generate timeout plus 15000 ms (warning otherwise) | — |
| outbox heartbeat | lease / 3 (60 s) | — | — |

A timeout at or below the "must exceed" value stops the API booting, so an
environment that still sets `ROADMAP_AI_GENERATE_TIMEOUT_MS` to the old 80000
must be changed or blanked before this version is deployed.

Any reverse proxy between the API and the provider, or between a browser and
the API, must wait longer than the timeout of the call that passes through it:
more than 150 s for the provider's generate path and more than 35 s for a chat
turn. This repository ships no proxy configuration; the proxy is operated
outside it (`compose.production.yaml` expects a TLS proxy in front).
Generation itself runs from the outbox, so a browser never waits on it. The outbox
processor renews a running claim every third of the lease, so a generation that
outlives the initial lease keeps its claim; the lease should still cover a
normal generation, and startup logs `roadmap-ai.lease-shorter-than-generate`
when it does not.

## Configuration

| Setting | Behaviour |
| --- | --- |
| `ROADMAP_AI_BASE_URL` | Used exactly as written, so `:8443` is kept. Must be a valid http(s) URL without credentials, and https when `NODE_ENV=production`. Blank leaves the integration unconfigured. |
| `ROADMAP_AI_SERVICE_TOKEN` | Backend only. Never logged and never in a response. Blank leaves the integration unconfigured. |

Unconfigured is not a crash: the API boots, `/health` and `/ready` stay green
(neither depends on the provider), startup logs `roadmap-ai.not-configured`, and
every call fails as non-retryable unavailable. A provider that is merely down is
retryable and never affects `/ready`. An invalid value (malformed URL, http in
production, a timeout under its floor) stops the API booting with a message
naming the variable.

## Observability

Every call writes one `roadmap-ai.call` line: `operation` (`chat` or
`generate`), `path`, `status`, `durationMs`, `outcome`, `retryable`,
`retryAfterSeconds`, `providerCode`, `model`, `contractVersion`, and
`promptTokens`/`completionTokens`/`totalTokens` when the provider sends them
(under `X-Prompt-Tokens`/`X-Completion-Tokens`/`X-Total-Tokens` or
`X-Tokens-Input`/`X-Tokens-Output`/`X-Tokens-Total`). Neither a prompt nor a
user message is ever logged.

Two identifiers travel together and are never merged:

- `correlationId` is the local one. The request's identifier is sent as
  `X-Correlation-Id`; an outbox handler runs inside the correlation of the
  request that queued the event, so a generation shares it end to end.
- `providerCorrelationId` is the provider's, from the error body or the
  `X-Correlation-Id` response header. It is kept on the failure object and
  appears in `roadmap-chat.turn` and `roadmap-generation.provider-failure`.

A different `X-Contract-Version` is logged once per process: an error for a
different major version, a warning otherwise.

## Concurrency

- **Chat turns for one draft** run one after another inside an instance. Across
  instances the final write is conditional on the draft not having changed since
  the turn read it; the turn that lost is rejected with `ROADMAP_DRAFT_LOCKED`
  before it writes an assistant message, so a stale answer never merges over a
  newer one. The professional's own message is already stored, so a retry sends
  it again.
- **Generation** is protected by the outbox lease, attempt fencing and the
  conditional `GENERATING → COMPLETED` write described under Outbox in
  `concurrency-operations.md`.

## Locale

The contract accepts `en` and `fa`. The platform's interface languages are
English and French, so every call is sent with `locale = "en"`; a French
professional receives English interview wording. This is expected until the
provider supports French; it is not a platform defect.

## Readiness

One helper, `getRoadmapDraftContractReadiness`, decides whether a draft can be
generated. It follows what the provider's generate endpoint requires, plus the
platform's own rule that at least one known subject is chosen.

| Field | Required |
| --- | --- |
| goal, skill level, weekly time | always |
| subjects | at least one subject the taxonomy knows; an empty list counts as missing |
| budget preference | always |
| CPD answer (`cpdAnswered`) | always; "no" is an answer, an unanswered question is not |
| certification name | only when CPD tracking was answered "yes" |

A draft needs 6 required fields, or 7 once CPD tracking is answered "yes".
`requiredFieldCount`, `completedFieldCount` and `missingFields` all come from
that helper. `canGenerate` is true for a `READY` or `FAILED` draft whose
`missingFields` is empty. A normal chat turn promotes a draft to `READY` only when
the provider says `is_complete`, does not ask for clarification, and the helper
agrees. A structured edit in the review panel promotes a `COLLECTING` or `FAILED`
draft to `READY` as soon as the helper agrees, and returns a `READY` or `FAILED`
draft to `COLLECTING` when a required field is gone. Drafts saved before the
budget and CPD fields were required stay in their status until the next turn or
edit; `canGenerate` is false for them in the meantime.

The draft sent to the provider carries `subjects: null` while no subject is
chosen (never `[]`) and `cpd_enabled: null` while the CPD question is
unanswered. The provider's CPD widget may arrive as `single_select` with the
options `"true"` and `"false"`; the platform shows it as a yes or no question.
