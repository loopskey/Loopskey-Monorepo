import { PaginatedAdminOrgAccessRequestsEntity } from "@admin/entities/paginated-admin-org-access-request.entity";
import { RejectAdminOrgAccessRequestInput } from "@admin/dtos/reject-admin-org-access-request.input";
import { AdminOrgAccessRequestFilterInput } from "@admin/dtos/admin-org-access-request-filter.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AdminDashboardGqlMutationNames } from "@admin/enums/gql-names.enum";
import { PaginatedAdminAuditLogsEntity } from "@admin/entities/paginated-admin-audit-logs.entity";
import { AdminDashboardOverviewEntity } from "@admin/entities/admin-overview.entity";
import { AdminDashboardGqlQueryNames } from "@admin/enums/gql-names.enum";
import { AdminOrgAccessRequestEntity } from "@admin/entities/admin-org-access-request.entity";
import { UpdateAdminUserStatusInput } from "@admin/dtos/update-admin-user-status.input";
import { PaginatedAdminUsersEntity } from "@admin/entities/paginated-admin-users.entity";
import { AdminAuditLogFilterInput } from "@admin/dtos/admin-audit-log-filter.input";
import { UpdateAdminProfileInput } from "@admin/dtos/update-admin-profile.input";
import { AdminChartPointEntity } from "@admin/entities/admin-chart-point.entity";
import { AdminDashboardService } from "@admin/services/admin.service";
import { AdminUserFilterInput } from "@admin/dtos/admin-user-filter.input";
import { AdminPaginationInput } from "@admin/dtos/admin-pagination.input";
import { AdminProfileEntity } from "@admin/entities/admin-profile.entity";
import { AdminUserEntity } from "@admin/entities/admin-user.entity";
import { TResolverUser } from "@admin/types/admin-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ADMIN)
export class AdminDashboardResolver {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => AdminProfileEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_PROFILE,
  })
  adminProfile(@CurrentUser() user: TResolverUser) {
    return this.adminDashboardService.profile(this.getUser(user));
  }

  @Mutation(() => AdminProfileEntity, {
    name: AdminDashboardGqlMutationNames.UPDATE_ADMIN_PROFILE,
  })
  updateAdminProfile(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAdminProfileInput,
  ) {
    return this.adminDashboardService.updateProfile(this.getUser(user), input);
  }

  @Query(() => AdminDashboardOverviewEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_OVERVIEW,
  })
  adminDashboardOverview(@CurrentUser() user: TResolverUser) {
    return this.adminDashboardService.overview(this.getUser(user));
  }

  @Query(() => PaginatedAdminUsersEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_USERS,
  })
  adminUsers(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: AdminUserFilterInput,
    @Args("pagination", { nullable: true }) pagination?: AdminPaginationInput,
  ) {
    return this.adminDashboardService.users(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => [AdminChartPointEntity], {
    name: AdminDashboardGqlQueryNames.ADMIN_USER_GROWTH,
  })
  adminUserGrowth(
    @CurrentUser() user: TResolverUser,
    @Args("mode", { nullable: true, defaultValue: "DAILY" })
    mode?: "DAILY" | "MONTHLY",
  ) {
    return this.adminDashboardService.userGrowth(this.getUser(user), mode);
  }

  @Mutation(() => AdminUserEntity, {
    name: AdminDashboardGqlMutationNames.UPDATE_ADMIN_USER_STATUS,
  })
  updateAdminUserStatus(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAdminUserStatusInput,
  ) {
    return this.adminDashboardService.updateUserStatus(
      this.getUser(user),
      input,
    );
  }

  @Query(() => PaginatedAdminOrgAccessRequestsEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_ORG_ACCESS_REQUESTS,
  })
  adminOrgAccessRequests(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: AdminOrgAccessRequestFilterInput,
    @Args("pagination", { nullable: true }) pagination?: AdminPaginationInput,
  ) {
    return this.adminDashboardService.orgAccessRequests(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => AdminOrgAccessRequestEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_ORG_ACCESS_REQUEST_DETAIL,
  })
  adminOrgAccessRequestDetail(
    @CurrentUser() user: TResolverUser,
    @Args("requestId") requestId: string,
  ) {
    return this.adminDashboardService.orgAccessRequestDetail(
      this.getUser(user),
      requestId,
    );
  }

  @Mutation(() => AdminOrgAccessRequestEntity, {
    name: AdminDashboardGqlMutationNames.APPROVE_ADMIN_ORG_ACCESS_REQUEST,
  })
  approveAdminOrgAccessRequest(
    @CurrentUser() user: TResolverUser,
    @Args("requestId") requestId: string,
  ) {
    return this.adminDashboardService.approveOrgAccessRequest(
      this.getUser(user),
      requestId,
    );
  }

  @Mutation(() => AdminOrgAccessRequestEntity, {
    name: AdminDashboardGqlMutationNames.REJECT_ADMIN_ORG_ACCESS_REQUEST,
  })
  rejectAdminOrgAccessRequest(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: RejectAdminOrgAccessRequestInput,
  ) {
    return this.adminDashboardService.rejectOrgAccessRequest(
      this.getUser(user),
      input.requestId,
      input.reason,
    );
  }

  @Mutation(() => AdminOrgAccessRequestEntity, {
    name: AdminDashboardGqlMutationNames.RESEND_ADMIN_ORG_ACCESS_REQUEST_NOTIFICATION,
  })
  resendAdminOrgAccessRequestNotification(
    @CurrentUser() user: TResolverUser,
    @Args("requestId") requestId: string,
  ) {
    return this.adminDashboardService.resendOrgAccessRequestNotification(
      this.getUser(user),
      requestId,
    );
  }

  @Query(() => PaginatedAdminAuditLogsEntity, {
    name: AdminDashboardGqlQueryNames.ADMIN_AUDIT_LOGS,
  })
  adminAuditLogs(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: AdminAuditLogFilterInput,
    @Args("pagination", { nullable: true }) pagination?: AdminPaginationInput,
  ) {
    return this.adminDashboardService.auditLogs(
      this.getUser(user),
      filter,
      pagination,
    );
  }
}
