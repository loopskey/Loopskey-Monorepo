import { AssociationActivationTokenStatus } from "@auth/enums/association-activation-token-status.enum";
import { AuthGqlObjectNames } from "@auth/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AuthGqlObjectNames.ASSOCIATION_ACTIVATION_STATUS)
export class AssociationActivationStatusEntity {
  @Field(() => AssociationActivationTokenStatus)
  status!: AssociationActivationTokenStatus;
  @Field(() => String, { nullable: true }) associationName?: string | null;
}
