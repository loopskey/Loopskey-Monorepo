import { AppLanguage, AppTheme, ProfileVisibility } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_SETTINGS_INPUT)
export class UpdateProfessionalSettingsInput {
  @Field(() => AppLanguage, { nullable: true })
  @IsOptional()
  @IsEnum(AppLanguage)
  interfaceLanguage?: AppLanguage;

  @Field(() => AppTheme, { nullable: true })
  @IsOptional()
  @IsEnum(AppTheme)
  theme?: AppTheme;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  courseUpdates?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  messages?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  eventReminders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  loginAlerts?: boolean;

  @Field(() => ProfileVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showLearningProgress?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showCertificates?: boolean;
}
