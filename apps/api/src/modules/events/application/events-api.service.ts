import { EventRegistrationProjection } from "@events/public/events-api";
import { RegisterForEventCommand } from "@events/public/events-api";
import { EventService } from "@events/services/event.service";
import { Injectable } from "@nestjs/common";
import { EventsApi } from "@events/public/events-api";
import { EventRatingWriter } from "@events/public/events-api";

import type { ProviderAttendeesQuery } from "@events/public/events-api";
import type { RoadmapCandidateQuery } from "@events/public/events-api";
import type { ProviderEventsQuery } from "@events/public/events-api";

@Injectable()
export class EventsApiService implements EventsApi {
  constructor(private readonly eventService: EventService) {}

  enrollInEvent(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection> {
    return this.eventService.enrollInEvent(command.eventId, {
      id: command.userId,
    });
  }

  cancelEventRegistration(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection> {
    return this.eventService.cancelEventRegistration(command.eventId, {
      id: command.userId,
    });
  }

  resolveEvent(eventId: string) {
    return this.eventService.resolveForEngagement(eventId);
  }

  /**
   * `writer` lets the caller recompute and publish the aggregate inside one
   * transaction, which is what keeps a slower recomputation from landing after
   * a newer one. It defaults to the ambient client for callers with no
   * transaction of their own.
   */
  async updateEventRating(
    eventId: string,
    average: number,
    count: number,
    writer?: EventRatingWriter,
  ): Promise<void> {
    await this.eventService.updateEngagementRating(
      eventId,
      average,
      count,
      writer,
    );
  }

  providerOverview(providerId: string, start: Date, end: Date) {
    return this.eventService.providerOverview(providerId, start, end);
  }

  providerAnalyticsEvents(providerId: string, start: Date, end: Date) {
    return this.eventService.providerAnalyticsEvents(providerId, start, end);
  }

  providerAttendees(query: ProviderAttendeesQuery) {
    return this.eventService.providerAttendees(query);
  }

  providerEvents(query: ProviderEventsQuery) {
    return this.eventService.providerEvents(query);
  }

  async assertProviderOwnsEvent(
    providerId: string,
    eventId: string,
  ): Promise<void> {
    await this.eventService.assertProviderOwnsEvent(providerId, eventId);
  }

  eventCredits(eventIds: readonly string[]) {
    return this.eventService.eventCredits(eventIds);
  }

  roadmapCandidateEvents(query: RoadmapCandidateQuery) {
    return this.eventService.roadmapCandidates(query);
  }
}
