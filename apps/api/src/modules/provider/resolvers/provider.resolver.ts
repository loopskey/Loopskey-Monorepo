import { PaginatedProviderAttendeesEntity } from "@provider/entities/paginated-provider-attendees.entity";
import { PaginatedPromotionRequestsEntity } from "@provider/entities/paginated-promotion-requests.entity";
import { ProviderDashboardPaginationInput } from "@provider/dtos/provider-pagination.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PaginatedProviderEventsEntity } from "@provider/entities/paginated-provider-events.entity";
import { ProviderPromotionFilterInput } from "@provider/dtos/provider-promotion-filter.input";
import { ProviderAttendeesFilterInput } from "@provider/dtos/provider-attendees-filter.input";
import { UpdateProviderSettingsInput } from "@provider/dtos/update-provider-setting.input";
import { ProviderDashboardRangeInput } from "@provider/dtos/provider-range.input";
import { SubmitPromotionRequestInput } from "@provider/dtos/submit-promotion-request.input";
import { ProviderEventsFilterInput } from "@provider/dtos/provider-events-filter.input";
import { ProviderGqlQueryMutation } from "@provider/enums/gql-names.enum";
import { ProviderAnalyticsEntity } from "@provider/entities/provider-analytics.entity";
import { ProviderSettingsEntity } from "@provider/entities/provider-settings.entity";
import { ProviderOverviewEntity } from "@provider/entities/provider-overview.entity";
import { PromotionRequestEntity } from "@provider/entities/promotion-request.entity";
import { ProviderGqlQueryNames } from "@provider/enums/gql-names.enum";
import { CsvExportEntity } from "@provider/entities/csv-export.entity";
import { ProviderService } from "@provider/services/provider.service";
import { TCurrentUser } from "@provider/types/provider-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROVIDER, Role.ADMIN)
export class ProviderResolver {
  constructor(private readonly providerService: ProviderService) {}

  private getUser(user: TCurrentUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => ProviderSettingsEntity, {
    name: ProviderGqlQueryNames.PROVIDER_SETTINGS,
  })
  providerSettings(@CurrentUser() user: TCurrentUser) {
    return this.providerService.providerSettings(this.getUser(user));
  }

  @Mutation(() => ProviderSettingsEntity, {
    name: ProviderGqlQueryMutation.UPDATE_PROVIDER_SETTINGS,
  })
  updateProviderSettings(
    @CurrentUser() user: TCurrentUser,
    @Args("input") input: UpdateProviderSettingsInput,
  ) {
    return this.providerService.updateProviderSettings(
      this.getUser(user),
      input,
    );
  }

  @Query(() => ProviderOverviewEntity, {
    name: ProviderGqlQueryNames.PROVIDER_OVERVIEW,
  })
  providerOverview(
    @CurrentUser() user: TCurrentUser,
    @Args("input", { nullable: true }) input?: ProviderDashboardRangeInput,
  ) {
    return this.providerService.overview(this.getUser(user), input);
  }

  @Query(() => ProviderAnalyticsEntity, {
    name: ProviderGqlQueryNames.PROVIDER_ANALYTICS,
  })
  providerAnalytics(
    @CurrentUser() user: TCurrentUser,
    @Args("input", { nullable: true }) input?: ProviderDashboardRangeInput,
  ) {
    return this.providerService.analytics(this.getUser(user), input);
  }

  @Query(() => CsvExportEntity, {
    name: ProviderGqlQueryNames.PROVIDER_ANALYTICS_CSV,
  })
  providerAnalyticsCsv(
    @CurrentUser() user: TCurrentUser,
    @Args("input", { nullable: true }) input?: ProviderDashboardRangeInput,
  ) {
    return this.providerService.analyticsCsv(this.getUser(user), input);
  }

  @Query(() => PaginatedProviderAttendeesEntity, {
    name: ProviderGqlQueryNames.PROVIDER_ATTENDEES,
  })
  providerAttendees(
    @CurrentUser() user: TCurrentUser,
    @Args("filter", { nullable: true }) filter?: ProviderAttendeesFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: ProviderDashboardPaginationInput,
  ) {
    return this.providerService.attendees(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => PaginatedProviderEventsEntity, {
    name: ProviderGqlQueryNames.PROVIDER_EVENTS_TABLE,
  })
  providerEventsTable(
    @CurrentUser() user: TCurrentUser,
    @Args("filter", { nullable: true }) filter?: ProviderEventsFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: ProviderDashboardPaginationInput,
  ) {
    return this.providerService.eventsTable(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => PromotionRequestEntity, {
    name: ProviderGqlQueryMutation.SUBMIT_PROMOTION_REQUEST,
  })
  submitPromotionRequest(
    @CurrentUser() user: TCurrentUser,
    @Args("input") input: SubmitPromotionRequestInput,
  ) {
    return this.providerService.submitPromotionRequest(
      this.getUser(user),
      input,
    );
  }

  @Query(() => PaginatedPromotionRequestsEntity, {
    name: ProviderGqlQueryNames.PROVIDER_PROMOTION_REQUESTS,
  })
  providerPromotionRequests(
    @CurrentUser() user: TCurrentUser,
    @Args("filter", { nullable: true }) filter?: ProviderPromotionFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: ProviderDashboardPaginationInput,
  ) {
    return this.providerService.promotionRequests(
      this.getUser(user),
      filter,
      pagination,
    );
  }
}
