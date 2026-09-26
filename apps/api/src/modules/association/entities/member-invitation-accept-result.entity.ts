import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.MEMBER_INVITATION_ACCEPT_RESULT)
export class MemberInvitationAcceptResultEntity {
  @Field(() => String) code!: string;
  @Field(() => String) message!: string;
  @Field(() => Boolean) success!: boolean;
}
