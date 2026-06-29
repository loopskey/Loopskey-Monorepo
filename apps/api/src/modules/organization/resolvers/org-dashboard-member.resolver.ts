import { BulkAddOrganizationMembersResultEntity } from "@org/entities/bulk-add-org-member.entity";
import { OrganizationDashboardGqlMutationNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationDashboardGqlQueryNames } from "@org/enums/org-dashboard-gql-names.enum";
import { PaginatedOrganizationMembersEntity } from "@org/entities/org-member.entity";
import { UpdateOrganizationMemberNotesInput } from "@org/dtos/update-org-member-notes.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BulkAddOrganizationMembersInput } from "@org/dtos/bulk-add-org-members.input";
import { OrganizationMemberDetailEntity } from "@org/entities/org-members-detail.entity";
import { OrganizationMembersStatsEntity } from "@org/entities/org-members-stats.entity";
import { UpdateOrganizationMemberInput } from "@org/dtos/upadte-org-member.input";
import { OrganizationMemberFilterInput } from "@org/dtos/org-member-filter";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { AddOrganizationMemberInput } from "@org/dtos/add-org-member.input";
import { OrgDashboardMemberService } from "@org/services/org-dashboard-member.service";
import { OrganizationMemberEntity } from "@org/entities/org-member.entity";
import { TResolverUser } from "@org/types/org-dashboard-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ORGANIZATION, Role.ADMIN)
export class OrgDashboardMemberResolver {
  constructor(
    private readonly orgDashboardMemberService: OrgDashboardMemberService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedOrganizationMembersEntity, {
    name: OrganizationDashboardGqlQueryNames.MEMBERS,
  })
  members(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: OrganizationMemberFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationPaginationInput,
  ) {
    return this.orgDashboardMemberService.members(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => OrganizationMemberEntity, {
    name: OrganizationDashboardGqlMutationNames.ADD_MEMBER,
  })
  addMember(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: AddOrganizationMemberInput,
  ) {
    return this.orgDashboardMemberService.addMember(this.getUser(user), input);
  }

  @Mutation(() => OrganizationMemberEntity, {
    name: OrganizationDashboardGqlMutationNames.UPDATE_MEMBER,
  })
  updateMember(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateOrganizationMemberInput,
  ) {
    return this.orgDashboardMemberService.updateMember(
      this.getUser(user),
      input,
    );
  }

  @Query(() => OrganizationMembersStatsEntity, {
    name: "organizationMembersStats",
  })
  memberStats(@CurrentUser() user: TResolverUser) {
    return this.orgDashboardMemberService.memberStats(this.getUser(user));
  }

  @Query(() => OrganizationMemberDetailEntity, {
    name: "organizationMemberDetail",
  })
  memberDetail(
    @CurrentUser() user: TResolverUser,
    @Args("memberId") memberId: string,
  ) {
    return this.orgDashboardMemberService.memberDetail(
      this.getUser(user),
      memberId,
    );
  }

  @Mutation(() => BulkAddOrganizationMembersResultEntity, {
    name: "bulkAddOrganizationMembers",
  })
  bulkAddMembers(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: BulkAddOrganizationMembersInput,
  ) {
    return this.orgDashboardMemberService.bulkAddMembers(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => OrganizationMemberEntity, {
    name: "updateOrganizationMemberNotes",
  })
  updateMemberNotes(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateOrganizationMemberNotesInput,
  ) {
    return this.orgDashboardMemberService.updateMemberNotes(
      this.getUser(user),
      input,
    );
  }
}
