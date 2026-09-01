import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString, MaxLength } from "class-validator";

@InputType(AssociationGqlInputNames.RESEND_ASSOCIATION_ACTIVATION)
export class ResendAssociationActivationInput {
  @Field(() => ID)
  @IsString()
  @MaxLength(64)
  associationId!: string;
}
