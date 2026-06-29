import { PaginatedOrganizationCpdCategoriesEntity } from "@org/entities/paginated-org-cpd-categories.entity";
import { OrganizationDashboardGqlMutationNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationDashboardGqlQueryNames } from "@org/enums/org-dashboard-gql-names.enum";
import { CreateOrganizationCpdCategoryInput } from "@org/dtos/create-org-cpd-category.input";
import { UpdateOrganizationCpdCategoryInput } from "@org/dtos/update-org-cpd-category.input";
import { OrganizationCpdCategoryFilterInput } from "@org/dtos/org-cpd-category-filter.input";
import { OrganizationCpdCategoryStatsEntity } from "@org/entities/org-cpd-category-stats.entity";
import { OrganizationActionResponseEntity } from "@org/entities/org-action-response.entity";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrganizationCpdCategoryEntity } from "@org/entities/org-cpd-category.entity";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { OrgDashboardCPDService } from "@org/services/org-dashboard-cpd.service";
import { TResolverUser } from "@org/types/org-dashboard-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ORGANIZATION, Role.ADMIN)
export class OrgDashboardCPDResolver {
  constructor(
    private readonly orgDashboardCPDService: OrgDashboardCPDService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => OrganizationCpdCategoryStatsEntity, {
    name: "organizationCpdCategoryStats",
  })
  cpdCategoryStats(
    @CurrentUser() user: TResolverUser,
    @Args("year", { nullable: true }) year?: string,
  ) {
    return this.orgDashboardCPDService.cpdCategoryStats(
      this.getUser(user),
      year,
    );
  }

  @Query(() => PaginatedOrganizationCpdCategoriesEntity, {
    name: OrganizationDashboardGqlQueryNames.CPD_CATEGORIES,
  })
  cpdCategories(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: OrganizationCpdCategoryFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationPaginationInput,
  ) {
    return this.orgDashboardCPDService.cpdCategories(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => OrganizationCpdCategoryEntity, {
    name: OrganizationDashboardGqlMutationNames.CREATE_CPD_CATEGORY,
  })
  createCpdCategory(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateOrganizationCpdCategoryInput,
  ) {
    return this.orgDashboardCPDService.createCpdCategory(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationCpdCategoryEntity, {
    name: OrganizationDashboardGqlMutationNames.UPDATE_CPD_CATEGORY,
  })
  updateCpdCategory(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateOrganizationCpdCategoryInput,
  ) {
    return this.orgDashboardCPDService.updateCpdCategory(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationActionResponseEntity, {
    name: "deleteOrganizationCpdCategory",
  })
  deleteCpdCategory(
    @CurrentUser() user: TResolverUser,
    @Args("categoryId") categoryId: string,
  ) {
    return this.orgDashboardCPDService.deleteCpdCategory(
      this.getUser(user),
      categoryId,
    );
  }
}
