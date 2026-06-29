import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";

@ObjectType(ProviderGqlObjectNames.PROVIDER_SETTINGS)
export class ProviderSettingsEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) providerId: string;
  @Field() eventReminderEnabled: boolean;
  @Field() newRegistrationAlertEnabled: boolean;
  @Field(() => Int) reminderHoursBeforeEvent: number;
  @Field(() => String, { nullable: true }) contactEmail?: string | null;
  @Field(() => String, { nullable: true }) organizationName?: string | null;
  @Field(() => String, { nullable: true }) aboutOrganization?: string | null;
  @Field(() => String, { nullable: true }) organizationProfile?: string | null;
}
