/**
 * Why an atomic registration write refused to commit.
 *
 * These are the outcomes a concurrent request can legitimately reach, not
 * faults. The repository raises them so the service can answer with the
 * existing domain message codes instead of leaking a Prisma error code to a
 * client that only ever asked to take a seat.
 */
export type EventRegistrationConflictReason =
  /** No seat left at the instant the counter was claimed. */
  | "CAPACITY_REACHED"
  /** The event stopped accepting registrations while the request was in flight. */
  | "REGISTRATION_CLOSED"
  /** Another request created this user's registration first. */
  | "ALREADY_REGISTERED";

export class EventRegistrationConflict extends Error {
  constructor(readonly reason: EventRegistrationConflictReason) {
    super(`Event registration conflict: ${reason}`);
    this.name = "EventRegistrationConflict";
  }
}

export const isEventRegistrationConflict = (
  error: unknown,
): error is EventRegistrationConflict =>
  error instanceof EventRegistrationConflict;
