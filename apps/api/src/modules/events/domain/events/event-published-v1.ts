export const EVENT_PUBLISHED_V1 = "EventPublished.v1";

export type EventPublishedV1 = {
  readonly eventId: string;
  readonly schemaVersion: 1;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly providerId: string | null;
  readonly eventName: typeof EVENT_PUBLISHED_V1;
};
