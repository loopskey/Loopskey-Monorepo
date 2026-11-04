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

startRoadmapEdit (copy of the saved brief, one platform greeting)
sendRoadmapChatTurn on an edit draft
  → edit-turn (current roadmap with ids and progress, pending changes)
  → strict merge → validate change operations → replace the stored list
requestRoadmapGeneration on an edit draft (same outbox event)
  → generation handler → regenerate (0..50 candidates, approved changes,
    preservation flags) → verification → preservation check
  → one transaction: new roadmap, new enrollment, old one retired,
    progress carried by content identity → COMPLETED
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

## Clicked answers

The provider extracts weekly time and budget from the text of a message, in its
own coarser vocabulary, so a clicked "5+ hours per week" can come back as a
neighbouring band and be stored as "3-5 hours". When a professional clicks an
option for skill level, weekly time, budget or the CPD question, the web app
sends the chosen platform value with the message (`answerField`, `answerValue`).
The API validates it against the platform enum, rejects anything else before the
provider is called, and stores exactly that value over whatever the provider
extracted for that field. Fields the provider extracts for other topics in the
same message are still merged. A typed answer has no structured value and still
follows the provider's reading.

## Editing a roadmap

An edit is a second `RoadmapDraft` with `replacesRoadmapId` set. It starts as a
copy of the brief behind the roadmap's enrollment and one assistant message
with the code `ROADMAP_COACH_EDIT_GREETING`, written under a row lock so
reopening the edit never adds another. The original conversation stays on the
original draft; `professionalRoadmapHistory` returns it, following earlier
edits back to the first interview, oldest first, for the owner only.

Every chat turn on an edit draft goes to `edit-turn`, never `chat-turn`. The
platform sends the roadmap as it is stored, with real phase and step ids and
each step's `COMPLETED`/`IN_PROGRESS` status, the previous pending changes and
only the edit's own messages as history.

The provider returns the whole list of pending changes each turn. The platform
replaces the stored `RoadmapDraft.pendingChanges` with that list after checking
each entry against the learner's roadmap: a phase target must be one of its
phases, a step target one of its steps, `UPDATE_DRAFT` a known draft field and
`MODIFY_ROADMAP`/`REBUILD_ROADMAP` this roadmap or none. Removing or rewriting
a step that holds progress, or removing a phase that holds one, is refused.
Refused entries are logged by reason (never by instruction text), dropped, and
reported to the professional as a system message; while any are refused the
draft is not ready to regenerate. Extracted draft fields merge under the same
rules as the interview, and the write is conditional on the draft's
`updatedAt`, so a stale answer is refused (409) rather than overwriting a
sidebar edit made while the provider was thinking. Sidebar edits are
conditional the same way.

`is_ready_to_regenerate` is recorded as `readyToRegenerate`, never acted on.
Regeneration needs an explicit request, and `canGenerate` is true only when the
draft is valid, something changed (pending changes or a preference that differs
from the saved brief), the provider is not waiting for a clarification, any
pending changes are confirmed, and no stored change has gone stale.
`editBlockReason` names the first condition that fails.

### Regeneration and progress

Regeneration is the same outbox event and handler as generation; the handler
calls `regenerate` instead of `generate` when the draft has
`replacesRoadmapId`. It sends the roadmap with progress, the validated pending
changes and `preservation` with all three flags true. Candidates are optional
for an edit, because the content already in the roadmap can be enough.

Verification distinguishes two sources of content. New content must be one of
the candidates offered and must be free under `FREE_ONLY`. Content the learner
already has is accepted without being a candidate: protected content (steps
with progress) always, and under any budget other than `FREE_ONLY` every item
of the current roadmap. Protected paid content stays even after the budget
changes to `FREE_ONLY`.

After verification the handler checks preservation: every protected item must
appear somewhere in the new roadmap, and, unless a preference changed or a
roadmap-wide change was requested, every phase no change names must keep all of
its content. A failure marks the draft `FAILED` with
`PROTECTED_CONTENT_DROPPED` or `UNAFFECTED_PHASE_CHANGED`. Inside the commit
transaction `createRoadmapEnrollment` refuses (`RoadmapProgressNotPreservedError`)
when any progress record on the old enrollment, including one written after the
handler read it, has no step to move to; the transaction rolls back and the
draft fails. In every failure the old roadmap, enrollment and progress are
untouched and the edit draft keeps its brief and pending changes, so it can be
retried.

**Limitation.** `GeneratedStep` has no step id, so a regenerated step can be
matched to an old one only by `content_type` and `content_id`. Progress on a
step without content (for example a practice project) cannot be carried. Such
an edit is refused before any provider call: `editBlockReason` is
`PRESERVATION_UNSUPPORTED`, the request returns `ROADMAP_DRAFT_NOT_READY`, and a
job that finds it fails with `PROTECTED_STEP_WITHOUT_IDENTITY`. The activity
itself can be started and completed like any other step.
