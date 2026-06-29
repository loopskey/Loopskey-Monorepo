import { PaginatedOrganizationAssignmentsEntity } from "@org/entities/paginated-org-assignments.entity";
import { OrganizationDashboardGqlMutationNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationDashboardGqlQueryNames } from "@org/enums/org-dashboard-gql-names.enum";
import { CreateOrganizationAssignmentInput } from "@org/dtos/create-org-assignment.input";
import { OrganizationAssignmentStatsEntity } from "@org/entities/org-assignment-stats.entity";
import { OrganizationAssignmentFilterInput } from "@org/dtos/org-assignment-filter.input";
import { UpdateOrganizationAssignmentInput } from "@org/dtos/update-org-assignment.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrgDashboardAssignmentService } from "@org/services/org-dashboard-assignment.service";
import { OrganizationAssignmentEntity } from "@org/entities/org-assignment.entity";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { TResolverUser } from "@org/types/org-dashboard-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ORGANIZATION, Role.ADMIN)
export class OrgDashboardAssignmentResolver {
  constructor(
    private readonly orgDashboardAssignmentService: OrgDashboardAssignmentService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => OrganizationAssignmentStatsEntity, {
    name: "organizationAssignmentStats",
  })
  assignmentStats(@CurrentUser() user: TResolverUser) {
    return this.orgDashboardAssignmentService.assignmentStats(
      this.getUser(user),
    );
  }

  @Query(() => PaginatedOrganizationAssignmentsEntity, {
    name: OrganizationDashboardGqlQueryNames.ASSIGNMENTS,
  })
  assignments(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: OrganizationAssignmentFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationPaginationInput,
  ) {
    return this.orgDashboardAssignmentService.assignments(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => OrganizationAssignmentEntity, {
    name: OrganizationDashboardGqlMutationNames.CREATE_ASSIGNMENT,
  })
  createAssignment(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateOrganizationAssignmentInput,
  ) {
    return this.orgDashboardAssignmentService.createAssignment(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationAssignmentEntity, {
    name: "updateOrganizationAssignment",
  })
  updateAssignment(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateOrganizationAssignmentInput,
  ) {
    return this.orgDashboardAssignmentService.updateAssignment(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationAssignmentEntity, {
    name: "deleteOrganizationAssignment",
  })
  deleteAssignment(
    @CurrentUser() user: TResolverUser,
    @Args("assignmentId") assignmentId: string,
  ) {
    return this.orgDashboardAssignmentService.deleteAssignment(
      this.getUser(user),
      assignmentId,
    );
  }
}
