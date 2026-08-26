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

export type EventEngagementProjection = {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly currency: string;
  readonly isFree: boolean;
};

export interface EventsApi {
  enrollInEvent(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection>;
  cancelEventRegistration(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection>;
  resolveEvent(eventId: string): Promise<EventEngagementProjection>;
  updateEventRating(
    eventId: string,
    average: number,
    count: number,
  ): Promise<void>;
  providerOverview(
    providerId: string,
    start: Date,
    end: Date,
  ): Promise<ProviderOverviewProjection>;
  providerAnalyticsEvents(
    providerId: string,
    start: Date,
    end: Date,
  ): Promise<readonly ProviderAnalyticsEventProjection[]>;
  providerAttendees(query: ProviderAttendeesQuery): Promise<object>;
  providerEvents(query: ProviderEventsQuery): Promise<object>;
  assertProviderOwnsEvent(providerId: string, eventId: string): Promise<void>;
  roadmapCandidateEvents(
    query: RoadmapCandidateQuery,
  ): Promise<readonly RoadmapCandidateEventProjection[]>;

  eventCredits(eventIds: readonly string[]): Promise<Record<string, number>>;
}

export type ProviderAnalyticsEventProjection = {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly isFree: boolean;
  readonly views: number;
  readonly type: string;
  readonly pduCategory: string | null;
  readonly averageRating: number;
  readonly registrations: readonly {
    readonly id: string;
    readonly createdAt: Date;
    readonly status: string;
  }[];
};

export type ProviderOverviewProjection = {
  readonly totalEvents: number;
  readonly totalRegistrations: number;
  readonly totalViews: number;
  readonly published: number;
  readonly draft: number;
  readonly archived: number;
  readonly cancelled: number;
  readonly upcomingSessions: number;
};

export type ProviderAttendeesQuery = {
  readonly providerId: string;
  readonly eventId?: string;
  readonly status?: string;
  readonly search?: string;
  readonly cursor?: string;
  readonly take: number;
};

export type ProviderEventsQuery = {
  readonly providerId: string;
  readonly status?: string;
  readonly search?: string;
  readonly cursor?: string;
  readonly take: number;
};

/**
 * What the roadmap generator needs to rank an event. `pdu` matters more here
 * than anywhere else it appears: events are the only catalogue content that
 * carries a credit value, so this field is what lets a roadmap close a
 * professional's certification gap rather than merely look relevant to it.
 */
export type RoadmapCandidateEventProjection = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isFree: boolean;
  readonly pdu: number;
  readonly category: string;
  readonly topic: string | null;
  readonly specificTopic: string | null;
  readonly averageRating: number;
  readonly ratingCount: number;
  readonly attendees: number;
  readonly startDate: Date;
};

export type RoadmapCandidateQuery = {
  readonly subjects: readonly string[];
  readonly freeOnly: boolean;
  readonly take: number;
};
