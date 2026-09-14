import { IsBoolean, IsDate, IsInt, IsOptional } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_COMPLIANCE_SETTINGS)
export class UpdateAssociationComplianceSettingsInput {
  @Field(() => Int) @IsInt() onTrackThreshold: number;
  @Field(() => Int) @IsInt() atRiskThreshold: number;

  @Field()
  @IsDate()
  @Type(() => Date)
  expectedUpdatedAt: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_NOTIFICATION_SETTINGS)
export class UpdateAssociationNotificationSettingsInput {
  @Field()
  @IsBoolean()
  welcomeMessages: boolean;

  @Field()
  @IsBoolean()
  suppressAllEmail: boolean;

  @Field()
  @IsDate()
  @Type(() => Date)
  expectedUpdatedAt: Date;
}
