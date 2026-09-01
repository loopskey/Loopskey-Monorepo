import { ResendAssociationMemberInvitationInput } from "@association/dtos/resend-association-member-invitation.input";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AssociationBulkInviteResultEntity } from "@association/entities/association-invite-result.entity";
import { PaginatedAssociationMembersEntity } from "@association/entities/association-page-info.entity";
import { BulkInviteAssociationMembersInput } from "@association/dtos/bulk-invite-association-members.input";
import { SetAssociationMemberStatusInput } from "@association/dtos/set-association-member-status.input";
import { AssociationInviteResultEntity } from "@association/entities/association-invite-result.entity";
import { AssociationMemberStatsEntity } from "@association/entities/association-member-stats.entity";
import { AssociationMemberFilterInput } from "@association/dtos/association-member-filter.input";
import { UpdateAssociationMemberInput } from "@association/dtos/update-association-member.input";
import { InviteAssociationMemberInput } from "@association/dtos/invite-association-member.input";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { AssociationMemberService } from "@association/services/association-member.service";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { AssociationMemberEntity } from "@association/entities/association-member.entity";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationMemberResolver {
  constructor(private readonly members: AssociationMemberService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => PaginatedAssociationMembersEntity, {
    name: AssociationGqlQueryNames.MEMBERS,
  })
  associationMembers(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: AssociationMemberFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: AssociationPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.members.list(
      this.getUser(user),
      filter,
      pagination,
      associationId,
    );
  }

  @Query(() => AssociationMemberStatsEntity, {
    name: AssociationGqlQueryNames.MEMBER_STATS,
  })
  associationMemberStats(
    @CurrentUser() user: TResolverUser,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.members.stats(this.getUser(user), associationId);
  }

  @Mutation(() => AssociationInviteResultEntity, {
    name: AssociationGqlMutationNames.INVITE_MEMBER,
  })
  inviteAssociationMember(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: InviteAssociationMemberInput,
  ) {
    return this.members.invite(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationBulkInviteResultEntity, {
    name: AssociationGqlMutationNames.BULK_INVITE_MEMBERS,
  })
  bulkInviteAssociationMembers(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: BulkInviteAssociationMembersInput,
  ) {
    return this.members.bulkInvite(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationMemberEntity, {
    name: AssociationGqlMutationNames.UPDATE_MEMBER,
  })
  updateAssociationMember(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAssociationMemberInput,
  ) {
    return this.members.update(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationMemberEntity, {
    name: AssociationGqlMutationNames.SET_MEMBER_STATUS,
  })
  setAssociationMemberStatus(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: SetAssociationMemberStatusInput,
  ) {
    return this.members.setStatus(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationMemberEntity, {
    name: AssociationGqlMutationNames.RESEND_MEMBER_INVITATION,
  })
  resendAssociationMemberInvitation(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: ResendAssociationMemberInvitationInput,
  ) {
    return this.members.resendInvitation(this.getUser(user), input);
  }
}
