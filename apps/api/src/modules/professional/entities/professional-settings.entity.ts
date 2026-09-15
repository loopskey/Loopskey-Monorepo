import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AppLanguage, AppTheme } from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_SETTINGS)
export class ProfessionalSettingsEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => AppTheme) theme: AppTheme;
  @Field(() => AppLanguage) interfaceLanguage: AppLanguage;
}
