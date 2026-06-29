import { OrganizationDashboardGqlMutationNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationDashboardGqlQueryNames } from "@org/enums/org-dashboard-gql-names.enum";
import { CreateOrganizationDepartmentInput } from "@org/dtos/create-org-department.input";
import { UpdateOrganizationDepartmentInput } from "@org/dtos/update-org-department.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrgDashboardDepartmentService } from "@org/services/org-dashboard-department.service";
import { OrganizationDepartmentEntity } from "@org/entities/org-department.entity";
import { TResolverUser } from "@org/types/org-dashboard-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ORGANIZATION, Role.ADMIN)
export class OrgDashboardDepartmentResolver {
  constructor(
    private readonly orgDashboardDepartmentService: OrgDashboardDepartmentService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => [OrganizationDepartmentEntity], {
    name: OrganizationDashboardGqlQueryNames.DEPARTMENTS,
  })
  departments(@CurrentUser() user: TResolverUser) {
    return this.orgDashboardDepartmentService.departments(this.getUser(user));
  }

  @Mutation(() => OrganizationDepartmentEntity, {
    name: OrganizationDashboardGqlMutationNames.CREATE_DEPARTMENT,
  })
  createDepartment(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateOrganizationDepartmentInput,
  ) {
    return this.orgDashboardDepartmentService.createDepartment(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationDepartmentEntity, {
    name: OrganizationDashboardGqlMutationNames.UPDATE_DEPARTMENT,
  })
  updateDepartment(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateOrganizationDepartmentInput,
  ) {
    return this.orgDashboardDepartmentService.updateDepartment(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationDepartmentEntity, {
    name: "deleteOrganizationDepartment",
  })
  deleteDepartment(
    @CurrentUser() user: TResolverUser,
    @Args("departmentId") departmentId: string,
  ) {
    return this.orgDashboardDepartmentService.deleteDepartment(
      this.getUser(user),
      departmentId,
    );
  }
}
