import { UpdateAdminOrganizationSettingsInput } from "@admin/dtos/update-admin-org-settings.input";
import { PaginatedAdminOrganizationsEntity } from "@admin/entities/paginated-admin-org.entity";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AdminDashboardGqlMutationNames } from "@admin/enums/gql-names.enum";
import { PaginatedAdminOrgMembersEntity } from "@admin/entities/admin-page-info.entity";
import { AdminOrganizationFilterInput } from "@admin/dtos/admin-org-filter.input";
import { AdminDashboardGqlQueryNames } from "@admin/enums/gql-names.enum";
import { OrganizationSettingsEntity } from "@modules/organization/entities/org-settings.entity";
import { UpdateAdminOrgMemberInput } from "@admin/dtos/update-admin-org-member.input";
import { AdminOrgMemberFilterInput } from "@admin/dtos/admin-org-member-filter.input";
import { AdminPaginationInput } from "@admin/dtos/admin-pagination.input";
import { AdminOrgDetailEntity } from "@admin/entities/admin-org-detail.entity";
import { AdminOrgMemberEntity } from "@admin/entities/admin-org-member.entity";
import { AdminOrgService } from "@admin/services/admin-org.service";
import { TResolverUser } from "@admin/types/admin-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ADMIN)
export class AdminOrgResolver {
  constructor(private readonly adminOrgService: AdminOrgService) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedAdminOrganizationsEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_ORGANIZATIONS,
  })
  adminOrganizations(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: AdminOrganizationFilterInput,
    @Args("pagination", { nullable: true }) pagination?: AdminPaginationInput,
  ) {
    return this.adminOrgService.organizations(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => AdminOrgDetailEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_ORGANIZATION_DETAIL,
  })
  adminOrganizationDetail(
    @CurrentUser() user: TResolverUser,
    @Args("organizationId") organizationId: string,
  ) {
    return this.adminOrgService.organizationDetail(
      this.getUser(user),
      organizationId,
    );
  }

  @Mutation(() => OrganizationSettingsEntity, {
    name: AdminDashboardGqlMutationNames.UPDATE_ADMIN_ORGANIZATION_SETTINGS,
  })
  updateAdminOrganizationSettings(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAdminOrganizationSettingsInput,
  ) {
    return this.adminOrgService.updateOrganizationSettings(
      this.getUser(user),
      input,
    );
  }

  @Query(() => PaginatedAdminOrgMembersEntity, {
    name: "adminOrganizationMembers",
  })
  adminOrganizationMembers(
    @CurrentUser() user: TResolverUser,
    @Args("filter") filter: AdminOrgMemberFilterInput,
    @Args("pagination", { nullable: true }) pagination?: AdminPaginationInput,
  ) {
    return this.adminOrgService.organizationMembers(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => AdminOrgMemberEntity, {
    name: "updateAdminOrganizationMember",
  })
  updateAdminOrganizationMember(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAdminOrgMemberInput,
  ) {
    return this.adminOrgService.updateOrganizationMember(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => AdminOrgMemberEntity, {
    name: "removeAdminOrganizationMember",
  })
  removeAdminOrganizationMember(
    @CurrentUser() user: TResolverUser,
    @Args("memberId") memberId: string,
  ) {
    return this.adminOrgService.removeOrganizationMember(
      this.getUser(user),
      memberId,
    );
  }
}
