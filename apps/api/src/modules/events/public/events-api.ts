export type EventRatingWriter = {
  readonly event: {
    update(args: {
      where: { id: string };
      data: { averageRating: number; rating: number; ratingCount: number };
    }): PromiseLike<unknown>;
  };
};

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
    writer?: EventRatingWriter,
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
  readonly draft: number;
  readonly archived: number;
  readonly published: number;
  readonly cancelled: number;
  readonly totalViews: number;
  readonly totalEvents: number;
  readonly upcomingSessions: number;
  readonly totalRegistrations: number;
};

export type ProviderAttendeesQuery = {
  readonly take: number;
  readonly status?: string;
  readonly search?: string;
  readonly cursor?: string;
  readonly eventId?: string;
  readonly providerId: string;
};

export type ProviderEventsQuery = {
  readonly take: number;
  readonly status?: string;
  readonly search?: string;
  readonly cursor?: string;
  readonly providerId: string;
};

export type RoadmapCandidateEventProjection = {
  readonly id: string;
  readonly pdu: number;
  readonly title: string;
  readonly startDate: Date;
  readonly isFree: boolean;
  readonly category: string;
  readonly attendees: number;
  readonly matchScore: number;
  readonly description: string;
  readonly ratingCount: number;
  readonly topic: string | null;
  readonly averageRating: number;
  readonly specificTopic: string | null;
};

export type RoadmapMatchTier = "EXACT" | "SIMILAR" | "RELATED" | "BROAD";

export type RoadmapCandidateQuery = {
  readonly take: number;
  readonly freeOnly: boolean;
  readonly tier: RoadmapMatchTier;
  readonly subjects: readonly string[];
  readonly keywords: readonly string[];
  readonly groupKeys: readonly string[];
};
