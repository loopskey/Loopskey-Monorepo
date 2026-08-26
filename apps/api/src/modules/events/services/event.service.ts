import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EventStatus, Prisma, Role } from "@prisma/client";
import { shouldEmitEventPublished } from "@events/domain/policies/event-publication.policy";
import { EventRegistrationStatus } from "@prisma/client";
import { EventPaginationInput } from "@events/dtos/event-pagination.input";
import { EVENT_PUBLISHED_V1 } from "@events/domain/events/event-published-v1";
import { CreateEventInput } from "@events/dtos/create-event.input";
import { EventFilterInput } from "@events/dtos/event-filter.input";
import { UpdateEventInput } from "@events/dtos/update-event.input";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { EventSortInput } from "@events/dtos/event-sort.input";
import { EventRequester } from "@events/enums/event-register.enum";
import { randomUUID } from "node:crypto";
import { slugify } from "@utils/slug.util";

import { type EventPublishedV1 } from "@events/domain/events/event-published-v1";

import type { ProviderAttendeesQuery } from "@events/public/events-api";
import type { RoadmapCandidateQuery } from "@events/public/events-api";
import type { ProviderEventsQuery } from "@events/public/events-api";

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventDispatcher: EventDomainEventDispatcher,
  ) {}

  async createEvent(input: CreateEventInput, requester: EventRequester) {
    this.ensureProviderOrAdmin(requester);
    const slug = await this.generateUniqueSlug(input.title);
    const isFree = input.isFree ?? (!input.price || input.price <= 0);
    return this.eventRepository.create({
      slug,
      isFree,
      type: input.type,
      pdu: input.pdu ?? 0,
      imageUrl: input.imageUrl,
      language: input.language,
      category: input.category,
      capacity: input.capacity,
      title: input.title.trim(),
      onlineUrl: input.onlineUrl,
      pduCategory: input.pduCategory,
      speaker: input.speaker?.trim(),
      location: input.location?.trim(),
      deliveryMode: input.deliveryMode,
      currency: input.currency ?? "USD",
      timezone: input.timezone ?? "UTC",
      specificTopic: input.specificTopic,
      organizer: input.organizer?.trim(),
      startDate: new Date(input.startDate),
      description: input.description.trim(),
      status: input.status ?? EventStatus.DRAFT,
      earlyBirdDiscount: input.earlyBirdDiscount,
      promotionVideoUrl: input.promotionVideoUrl,
      registrationEnabled: input.registrationEnabled ?? true,
      endDate: input.endDate ? new Date(input.endDate) : null,
      price: isFree ? null : new Prisma.Decimal(input.price ?? 0),
      providerId: requester.role === Role.PROVIDER ? requester.id : null,
    });
  }

  async updateEvent(input: UpdateEventInput, requester: EventRequester) {
    const event = await this.findExistingEvent(input.eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    const isFree =
      typeof input.isFree === "boolean"
        ? input.isFree
        : input.price !== undefined
          ? input.price <= 0
          : undefined;
    return this.eventRepository.update(input.eventId, {
      isFree,
      pdu: input.pdu,
      type: input.type,
      status: input.status,
      category: input.category,
      capacity: input.capacity,
      imageUrl: input.imageUrl,
      language: input.language,
      timezone: input.timezone,
      currency: input.currency,
      title: input.title?.trim(),
      onlineUrl: input.onlineUrl,
      pduCategory: input.pduCategory,
      speaker: input.speaker?.trim(),
      location: input.location?.trim(),
      deliveryMode: input.deliveryMode,
      organizer: input.organizer?.trim(),
      specificTopic: input.specificTopic,
      description: input.description?.trim(),
      promotionVideoUrl: input.promotionVideoUrl,
      earlyBirdDiscount: input.earlyBirdDiscount,
      registrationEnabled: input.registrationEnabled,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      price:
        isFree === true
          ? null
          : input.price !== undefined
            ? new Prisma.Decimal(input.price)
            : undefined,
    });
  }

  findEvents(
    filter?: EventFilterInput,
    pagination?: EventPaginationInput,
    sort?: EventSortInput,
  ) {
    const search = filter?.search?.trim();
    return search && search.length >= 2
      ? this.eventRepository.search(filter, pagination)
      : this.eventRepository.findPage(filter, pagination, sort);
  }

  async findEventById(eventId: string) {
    const event =
      await this.eventRepository.findActiveByIdWithSchedule(eventId);
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    await this.eventRepository.incrementViews(event.id);
    return event;
  }

  async findEventBySlug(slug: string) {
    const event = await this.eventRepository.findActiveBySlugWithSchedule(slug);
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    await this.eventRepository.incrementViews(event.id);
    return event;
  }

  async resolveForEngagement(eventId: string) {
    const event = await this.findExistingEvent(eventId);
    return {
      id: event.id,
      title: event.title,
      price: Number(event.price ?? 0),
      currency: event.currency ?? "USD",
      isFree: event.isFree,
    };
  }

  async updateEngagementRating(
    eventId: string,
    average: number,
    count: number,
  ) {
    await this.eventRepository.update(eventId, {
      averageRating: average,
      rating: average,
      ratingCount: count,
    });
  }

  providerOverview(providerId: string, start: Date, end: Date) {
    return this.eventRepository.providerOverview(providerId, start, end);
  }

  providerAnalyticsEvents(providerId: string, start: Date, end: Date) {
    return this.eventRepository.providerAnalyticsEvents(providerId, start, end);
  }

  providerAttendees(query: ProviderAttendeesQuery) {
    return this.eventRepository.providerAttendees(query);
  }

  providerEvents(query: ProviderEventsQuery) {
    return this.eventRepository.providerEvents(query);
  }

  async assertProviderOwnsEvent(providerId: string, eventId: string) {
    const event = await this.eventRepository.findActiveOwnedByProvider(
      eventId,
      providerId,
    );
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
  }

  findUpcomingEvents(take = 12) {
    return this.eventRepository.findUpcoming(take);
  }

  findFeaturedEvents(take = 12) {
    return this.eventRepository.findFeatured(take);
  }

  findMyProviderEvents(
    requester: EventRequester,
    filter?: EventFilterInput,
    pagination?: EventPaginationInput,
    sort?: EventSortInput,
  ) {
    this.ensureProviderOrAdmin(requester);
    return this.findEvents(
      {
        ...filter,
        providerId:
          requester.role === Role.PROVIDER ? requester.id : filter?.providerId,
      },
      pagination,
      sort,
    );
  }

  async registerEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    if (event.status !== EventStatus.PUBLISHED)
      throw new BadRequestException(EventMessageCode.EVENT_NOT_FOUND);
    if (!event.registrationEnabled)
      throw new BadRequestException(
        EventMessageCode.EVENT_REGISTRATION_DISABLED,
      );
    if (event.capacity && event.attendees >= event.capacity)
      throw new BadRequestException(EventMessageCode.EVENT_CAPACITY_REACHED);
    if (await this.eventRepository.findRegistration(eventId, requester.id))
      throw new BadRequestException(EventMessageCode.EVENT_ALREADY_REGISTERED);
    return this.eventRepository.register(eventId, requester.id);
  }

  async enrollInEvent(eventId: string, participant: EventParticipant) {
    const event = await this.findExistingEvent(eventId);
    if (event.status !== EventStatus.PUBLISHED)
      throw new BadRequestException(EventMessageCode.EVENT_NOT_FOUND);
    if (!event.registrationEnabled)
      throw new BadRequestException(
        EventMessageCode.EVENT_REGISTRATION_DISABLED,
      );
    const existing = await this.eventRepository.findRegistration(
      eventId,
      participant.id,
    );
    if (existing?.status === EventRegistrationStatus.CANCELLED) {
      if (event.capacity && event.attendees >= event.capacity)
        throw new BadRequestException(EventMessageCode.EVENT_CAPACITY_REACHED);
      return this.eventRepository.reactivateRegistration(existing.id, eventId);
    }
    if (existing) return existing;
    if (event.capacity && event.attendees >= event.capacity)
      throw new BadRequestException(EventMessageCode.EVENT_CAPACITY_REACHED);
    return this.eventRepository.register(eventId, participant.id);
  }

  async cancelEventRegistration(eventId: string, requester: EventParticipant) {
    const registration = await this.eventRepository.findRegistration(
      eventId,
      requester.id,
    );
    if (!registration)
      throw new NotFoundException(
        EventMessageCode.EVENT_REGISTRATION_NOT_FOUND,
      );
    if (registration.status === EventRegistrationStatus.CANCELLED)
      return registration;
    return this.eventRepository.cancelRegistration(registration.id, eventId);
  }

  myRegisteredEvents(requester: EventRequester) {
    return this.eventRepository.registrationsForUser(requester.id);
  }

  async publishEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    const published = await this.eventRepository.update(eventId, {
      status: EventStatus.PUBLISHED,
    });
    if (shouldEmitEventPublished(event.status)) {
      const domainEvent: EventPublishedV1 = {
        eventName: EVENT_PUBLISHED_V1,
        schemaVersion: 1,
        eventId: published.id,
        providerId: published.providerId,
        occurredAt: new Date().toISOString(),
        correlationId: randomUUID(),
      };
      await this.eventDispatcher.publish(domainEvent);
    }
    return published;
  }

  async archiveEvent(eventId: string, requester: EventRequester) {
    await this.assertOwner(eventId, requester);
    return this.eventRepository.update(eventId, {
      status: EventStatus.ARCHIVED,
    });
  }

  async cancelEvent(eventId: string, requester: EventRequester) {
    await this.assertOwner(eventId, requester);
    return this.eventRepository.update(eventId, {
      status: EventStatus.CANCELLED,
    });
  }

  async softDeleteEvent(eventId: string, requester: EventRequester) {
    await this.assertOwner(eventId, requester);
    return this.eventRepository.update(eventId, { deletedAt: new Date() });
  }

  async restoreEvent(eventId: string, requester: EventRequester) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    return this.eventRepository.update(eventId, { deletedAt: null });
  }

  private async assertOwner(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
  }

  private async findExistingEvent(eventId: string) {
    const event = await this.eventRepository.findActiveById(eventId);
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    return event;
  }

  private ensureProviderOrAdmin(requester: EventRequester) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED);
  }

  private ensureEventOwnerOrAdmin(
    providerId: string | null,
    requester: EventRequester,
  ) {
    if (requester.role === Role.ADMIN) return;
    if (requester.role !== Role.PROVIDER || providerId !== requester.id)
      throw new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED);
  }

  private async generateUniqueSlug(title: string) {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.eventRepository.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  async eventCredits(eventIds: readonly string[]) {
    const rows = await this.eventRepository.findCreditsByIds(eventIds);
    const credits: Record<string, number> = {};
    for (const row of rows) if (row.pdu > 0) credits[row.id] = row.pdu;
    return credits;
  }

  roadmapCandidates(query: RoadmapCandidateQuery) {
    return this.eventRepository.findRoadmapCandidates(query);
  }
}

type EventParticipant = { readonly id: string; readonly role?: Role };
