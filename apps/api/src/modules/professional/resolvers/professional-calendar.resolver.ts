import { PaginatedProfessionalCalendarEventsEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalCalendarEventsFilterInput } from "@professional/dtos/professional-calendar-filter.input";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalCalendarService } from "@professional/services/professional-calendar.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { Args, Query, Resolver } from "@nestjs/graphql";
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
}
