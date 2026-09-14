import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_SETTINGS)
export class AssociationSettingsEntity {
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field() welcomeMessages: boolean;
  @Field() suppressAllEmail: boolean;
  @Field(() => ID) associationId: string;
  @Field(() => Int) atRiskThreshold: number;
  @Field(() => Int) onTrackThreshold: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_SETTINGS_IMPACT)
export class AssociationSettingsImpactEntity {
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) membersChangingBand: number;
  @Field(() => Int) membersLeavingAtRisk: number;
  @Field(() => Int) membersEnteringAtRisk: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_COMPLIANCE_SETTINGS_PAYLOAD)
export class AssociationComplianceSettingsPayloadEntity {
  @Field() applied: boolean;
  @Field(() => AssociationSettingsEntity)
  settings: AssociationSettingsEntity;
  @Field(() => AssociationSettingsImpactEntity)
  impact: AssociationSettingsImpactEntity;
}
