import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { EventRegistrationEntity } from "@events/entities/event-registeration.entity";
import { PaginatedEventsEntity } from "@events/entities/paginated-events.entity";
import { EventGqlMutationNames } from "@events/enums/gql-names.enum";
import { EventPaginationInput } from "@events/dtos/event-pagination.input";
import { TCurrentUserPayload } from "@events/types/event-service.types";
import { EventGqlQueryNames } from "@events/enums/gql-names.enum";
import { CreateEventInput } from "@events/dtos/create-event.input";
import { UpdateEventInput } from "@events/dtos/update-event.input";
import { EventFilterInput } from "@events/dtos/event-filter.input";
import { EventSortInput } from "@events/dtos/event-sort.input";
import { EventService } from "@events/services/event.service";
import { EventEntity } from "@events/entities/event.entity";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Public } from "@auth/decorators/public.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => EventEntity)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Public()
  @Query(() => PaginatedEventsEntity, { name: EventGqlQueryNames.EVENTS })
  events(
    @Args("filter", { nullable: true }) filter?: EventFilterInput,
    @Args("pagination", { nullable: true }) pagination?: EventPaginationInput,
    @Args("sort", { nullable: true }) sort?: EventSortInput,
  ) {
    return this.eventService.findEvents(filter, pagination, sort);
  }

  @Public()
  @Query(() => EventEntity, { name: EventGqlQueryNames.EVENT_BY_ID })
  eventById(@Args("eventId") eventId: string) {
    return this.eventService.findEventById(eventId);
  }

  @Public()
  @Query(() => EventEntity, { name: EventGqlQueryNames.EVENT_BY_SLUG })
  eventBySlug(@Args("slug") slug: string) {
    return this.eventService.findEventBySlug(slug);
  }

  @Public()
  @Query(() => [EventEntity], { name: EventGqlQueryNames.UPCOMING_EVENTS })
  upcomingEvents(
    @Args("take", { type: () => Int, nullable: true, defaultValue: 12 })
    take?: number,
  ) {
    return this.eventService.findUpcomingEvents(take);
  }

  @Public()
  @Query(() => [EventEntity], { name: EventGqlQueryNames.FEATURED_EVENTS })
  featuredEvents(
    @Args("take", { type: () => Int, nullable: true, defaultValue: 12 })
    take?: number,
  ) {
    return this.eventService.findFeaturedEvents(take);
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => PaginatedEventsEntity, {
    name: EventGqlQueryNames.MY_PROVIDER_EVENTS,
  })
  myProviderEvents(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("filter", { nullable: true }) filter?: EventFilterInput,
    @Args("pagination", { nullable: true }) pagination?: EventPaginationInput,
    @Args("sort", { nullable: true }) sort?: EventSortInput,
  ) {
    return this.eventService.findMyProviderEvents(
      { id: user.id ?? user.sub!, role: user.role },
      filter,
      pagination,
      sort,
    );
  }

  @Query(() => [EventRegistrationEntity], {
    name: EventGqlQueryNames.MY_REGISTERED_EVENTS,
  })
  myRegisteredEvents(@CurrentUser() user: TCurrentUserPayload) {
    return this.eventService.myRegisteredEvents({
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.CREATE_EVENT })
  createEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: CreateEventInput,
  ) {
    return this.eventService.createEvent(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.UPDATE_EVENT })
  updateEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdateEventInput,
  ) {
    return this.eventService.updateEvent(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Mutation(() => EventRegistrationEntity, {
    name: EventGqlMutationNames.REGISTER_EVENT,
  })
  registerEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.registerEvent(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Mutation(() => EventRegistrationEntity, {
    name: EventGqlMutationNames.CANCEL_EVENT_REGISTRATION,
  })
  cancelEventRegistration(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.cancelEventRegistration(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.PUBLISH_EVENT })
  publishEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.publishEvent(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.ARCHIVE_EVENT })
  archiveEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.archiveEvent(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.CANCEL_EVENT })
  cancelEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.cancelEvent(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.DELETE_EVENT })
  deleteEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.softDeleteEvent(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventEntity, { name: EventGqlMutationNames.RESTORE_EVENT })
  restoreEvent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.eventService.restoreEvent(eventId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }
}
