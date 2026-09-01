import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType(AssociationGqlInputNames.RESEND_ASSOCIATION_MEMBER_INVITATION)
export class ResendAssociationMemberInvitationInput {
  @Field(() => ID) @IsString() memberId!: string;
}
