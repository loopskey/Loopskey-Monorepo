export type RegisterForEventCommand = {
  readonly eventId: string;
  readonly userId: string;
};

export type EventRegistrationProjection = {
  readonly id: string;
  readonly eventId: string;
  readonly userId: string;
  readonly status: string;
};

export interface EventsApi {
  enrollInEvent(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection>;
  cancelEventRegistration(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection>;
}
