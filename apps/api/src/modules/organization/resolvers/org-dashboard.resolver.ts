import { PaginatedOrganizationReportTopMembersEntity } from "@org/entities/org-report.entity";
import { PaginatedOrganizationEventCatalogEntity } from "@org/entities/org-event-catalog.entity";
import { OrganizationReportTopMembersFilterInput } from "@org/dtos/org-report-top-members-filter.input";
import { OrganizationDashboardGqlMutationNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationDashboardGqlQueryNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateOrganizationSettingsInput } from "@org/dtos/update-org-settings.input";
import { OrganizationReportFilterInput } from "@org/dtos/org-report-filter.input";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { OrganizationSettingsEntity } from "@org/entities/org-settings.entity";
import { OrganizationOverviewEntity } from "@org/entities/org-overview.entity";
import { OrganizationReportEntity } from "@org/entities/org-report.entity";
import { EventCatalogFilterInput } from "@org/dtos/event-catalog-filter.input";
import { OrgDashboardService } from "@org/services/org-dashboard.service";
import { TResolverUser } from "@org/types/org-dashboard-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ORGANIZATION, Role.ADMIN)
export class OrgDashboardResolver {
  constructor(private readonly orgDashboardService: OrgDashboardService) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => OrganizationOverviewEntity, {
    name: OrganizationDashboardGqlQueryNames.OVERVIEW,
  })
  overview(@CurrentUser() user: TResolverUser) {
    return this.orgDashboardService.overview(this.getUser(user));
  }
  @Query(() => OrganizationSettingsEntity, {
    name: OrganizationDashboardGqlQueryNames.SETTINGS,
  })
  settings(@CurrentUser() user: TResolverUser) {
    return this.orgDashboardService.settings(this.getUser(user));
  }

  @Mutation(() => OrganizationSettingsEntity, {
    name: OrganizationDashboardGqlMutationNames.UPDATE_SETTINGS,
  })
  updateSettings(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateOrganizationSettingsInput,
  ) {
    return this.orgDashboardService.updateSettings(this.getUser(user), input);
  }

  @Query(() => PaginatedOrganizationEventCatalogEntity, {
    name: OrganizationDashboardGqlQueryNames.EVENT_CATALOG,
  })
  eventCatalog(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: EventCatalogFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationPaginationInput,
  ) {
    return this.orgDashboardService.eventCatalog(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => OrganizationReportEntity, {
    name: OrganizationDashboardGqlQueryNames.REPORTS,
  })
  reports(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: OrganizationReportFilterInput,
  ) {
    return this.orgDashboardService.reports(this.getUser(user), filter);
  }

  @Query(() => PaginatedOrganizationReportTopMembersEntity, {
    name: "organizationReportTopMembers",
  })
  reportTopMembers(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: OrganizationReportTopMembersFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationPaginationInput,
  ) {
    return this.orgDashboardService.reportTopMembers(
      this.getUser(user),
      filter,
      pagination,
    );
  }
}
