import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { CreditType } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_SETTINGS)
export class AssociationSettingsEntity {
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field() weeklyDigest: boolean;
  @Field() welcomeMessages: boolean;
  @Field() complianceReminders: boolean;
  @Field(() => ID) associationId: string;
  @Field(() => Int) atRiskThreshold: number;
  @Field(() => Int) onTrackThreshold: number;
  @Field() renewalRequiresReviewedEvidence: boolean;
  @Field(() => CreditType) defaultCreditType: CreditType;
}
