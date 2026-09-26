import { MemberInvitationAcceptResultEntity } from "@association/entities/member-invitation-accept-result.entity";
import { AssociationMemberInvitationService } from "@association/services/association-member-invitation.service";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { MemberInvitationStatusEntity } from "@association/entities/member-invitation-status.entity";
import { AcceptMemberInvitationInput } from "@association/dtos/accept-member-invitation.input";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { Public } from "@common/decorators/public.decorator";

@Resolver()
export class AssociationMemberInvitationResolver {
  constructor(
    private readonly invitations: AssociationMemberInvitationService,
  ) {}

  @Public()
  @Query(() => MemberInvitationStatusEntity, {
    name: AssociationGqlQueryNames.MEMBER_INVITATION_STATUS,
  })
  memberInvitationStatus(@Args("token") token: string) {
    return this.invitations.describeInvitation(token);
  }

  @Public()
  @Mutation(() => MemberInvitationAcceptResultEntity, {
    name: AssociationGqlMutationNames.ACCEPT_MEMBER_INVITATION,
  })
  acceptMemberInvitation(@Args("input") input: AcceptMemberInvitationInput) {
    return this.invitations.acceptInvitation(input);
  }
}
