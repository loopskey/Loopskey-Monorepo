/**
 * Mirrors the server's `SERVICE_AI_LIMITS.userMessageMaxLength`, which comes
 * from the Roadmap AI contract. The server is authoritative and rejects an
 * over-long message on its own; this exists so the professional sees a counter
 * while typing instead of an error after sending.
 *
 * If the provider raises the limit, this is the second place to change.
 */
export const ROADMAP_MESSAGE_MAX_LENGTH = 2000;

/** How much headroom is left when the counter appears. */
export const ROADMAP_COUNTER_THRESHOLD = 200;

/** Matches the server's default transcript page. */
export const ROADMAP_TRANSCRIPT_PAGE_SIZE = 30;

/**
 * Error codes the wizard treats as conversation rather than failure. The
 * server records a refusal on the draft and returns it successfully, so these
 * only arrive when something went wrong before that point.
 */
export const ROADMAP_BUSY_CODE = "ROADMAP_AI_BUSY";
export const ROADMAP_DRAFT_LOCKED_CODE = "ROADMAP_DRAFT_LOCKED";
