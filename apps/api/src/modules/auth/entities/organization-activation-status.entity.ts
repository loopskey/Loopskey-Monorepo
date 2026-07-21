import { OrganizationActivationTokenStatus } from "@auth/enums/organization-activation-token-status.enum";
import { AuthGqlObjectNames } from "@auth/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AuthGqlObjectNames.ORGANIZATION_ACTIVATION_STATUS)
export class OrganizationActivationStatusEntity {
  @Field(() => OrganizationActivationTokenStatus)
  status!: OrganizationActivationTokenStatus;
  @Field(() => String, { nullable: true }) organizationName?: string | null;
}
