import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { AppLanguage, AppTheme } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
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
}
