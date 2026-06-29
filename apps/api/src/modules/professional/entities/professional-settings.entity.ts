import { AppLanguage, AppTheme, ProfileVisibility } from "@prisma/client";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_SETTINGS)
export class ProfessionalSettingsEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() messages: boolean;
  @Field(() => ID) id: string;
  @Field() showEmail: boolean;
  @Field() loginAlerts: boolean;
  @Field() courseUpdates: boolean;
  @Field(() => ID) userId: string;
  @Field() eventReminders: boolean;
  @Field() showCertificates: boolean;
  @Field() pushNotifications: boolean;
  @Field() emailNotifications: boolean;
  @Field(() => AppTheme) theme: AppTheme;
  @Field() showLearningProgress: boolean;
  @Field(() => AppLanguage) interfaceLanguage: AppLanguage;
  @Field(() => ProfileVisibility) profileVisibility: ProfileVisibility;
}
