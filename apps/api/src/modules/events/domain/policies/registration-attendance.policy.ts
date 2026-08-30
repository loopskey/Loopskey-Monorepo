import { EventRegistrationStatus } from "@prisma/client";

/**
 * The statuses that occupy a seat.
 *
 * `attendees` counts these and nothing else, which is also what the migration
 * that reconciled the column computed. The enum carries both `CANCELED` and
 * `CANCELLED` spellings from an earlier schema, so listing the occupied states
 * is safer than listing the vacated ones.
 */
export const ATTENDING_STATUSES: readonly EventRegistrationStatus[] = [
  EventRegistrationStatus.REGISTERED,
  EventRegistrationStatus.ATTENDED,
  EventRegistrationStatus.COMPLETED,
];

export const VACATED_STATUSES: readonly EventRegistrationStatus[] =
  Object.values(EventRegistrationStatus).filter(
    (status) => !ATTENDING_STATUSES.includes(status),
  );

export const isAttending = (status: EventRegistrationStatus) =>
  ATTENDING_STATUSES.includes(status);
