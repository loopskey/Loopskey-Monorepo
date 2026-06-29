import { IsBoolean, IsEmail, IsInt, Max, Min } from "class-validator";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType(ProviderGqlInputNames.UPDATE_PROVIDER_SETTINGS_INPUT)
export class UpdateProviderSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizationProfile?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  aboutOrganization?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  newRegistrationAlertEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  eventReminderEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  reminderHoursBeforeEvent?: number;
}
