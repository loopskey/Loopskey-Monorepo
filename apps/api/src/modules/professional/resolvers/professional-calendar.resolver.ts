import { PaginatedProfessionalCalendarEventsEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalManualCalendarEventEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalCalendarEventsFilterInput } from "@professional/dtos/professional-calendar-filter.input";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalActionResponseEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalCalendarService } from "@professional/services/professional-calendar.service";
import { CreateCalendarEventInput } from "@professional/dtos/create-calendar-event.input";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalCalendarResolver {
  constructor(
    private readonly professionalCalendarService: ProfessionalCalendarService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedProfessionalCalendarEventsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CALENDAR_EVENTS,
  })
  professionalCalendarEvents(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: ProfessionalCalendarEventsFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalCalendarService.calendarEvents(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => [ProfessionalManualCalendarEventEntity], {
    name: ProfessionalGqlQueryNames.MY_CALENDAR_ENTRIES,
  })
  myCalendarEntries(@CurrentUser() user: TResolverUser) {
    return this.professionalCalendarService.myCalendarEntries(
      this.getUser(user),
    );
  }

  @Mutation(() => ProfessionalManualCalendarEventEntity, {
    name: ProfessionalGqlMutationNames.CREATE_CALENDAR_EVENT,
  })
  createCalendarEvent(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateCalendarEventInput,
  ) {
    return this.professionalCalendarService.createCalendarEvent(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalActionResponseEntity, {
    name: ProfessionalGqlMutationNames.DELETE_CALENDAR_EVENT,
  })
  deleteCalendarEvent(
    @CurrentUser() user: TResolverUser,
    @Args("id", { type: () => ID }) id: string,
  ) {
    return this.professionalCalendarService.deleteCalendarEvent(
      this.getUser(user),
      id,
    );
  }
}
