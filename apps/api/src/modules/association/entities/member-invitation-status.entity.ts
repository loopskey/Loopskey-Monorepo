import { MemberInvitationTokenStatus } from "@association/enums/member-invitation-token-status.enum";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.MEMBER_INVITATION_STATUS)
export class MemberInvitationStatusEntity {
  @Field(() => MemberInvitationTokenStatus)
  status!: MemberInvitationTokenStatus;

  @Field(() => String, { nullable: true })
  associationName?: string | null;

  @Field(() => Boolean)
  requiresPassword!: boolean;
}
