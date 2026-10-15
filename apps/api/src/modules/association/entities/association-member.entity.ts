import { AssociationComplianceSummaryEntity } from "@association/entities/association-compliance.entity";
import { AssociationMemberGroupEntity } from "@association/entities/association-group.entity";
import { AssociationMemberJoinedVia } from "@prisma/client";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationMemberStatus } from "@prisma/client";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AssociationMessageDeliveryState } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_INVITATION_DELIVERY)
export class AssociationInvitationDeliveryEntity {
  @Field(() => ID) id: string;
  @Field() createdAt: Date;
  @Field(() => Date, { nullable: true }) sentAt: Date | null;
  @Field(() => String, { nullable: true }) failureReason: string | null;
  @Field(() => AssociationMessageDeliveryState)
  state: AssociationMessageDeliveryState;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER)
export class AssociationMemberEntity {
  @Field(() => AssociationInvitationDeliveryEntity, { nullable: true })
  invitationDelivery: AssociationInvitationDeliveryEntity | null;
  @Field() invitedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => [String]) requirementNames: string[];
  @Field(() => String, { nullable: true }) notes: string | null;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => Date, { nullable: true }) lastLoginAt: Date | null;
  @Field(() => Date, { nullable: true }) activatedAt: Date | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) avatarUrl: string | null;
  @Field(() => Date, { nullable: true }) deactivatedAt: Date | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => AssociationMemberStatus) status: AssociationMemberStatus;
  @Field(() => AssociationMemberJoinedVia)
  joinedVia: AssociationMemberJoinedVia;
  @Field(() => AssociationMemberGroupEntity, { nullable: true })
  group: AssociationMemberGroupEntity | null;
  @Field(() => AssociationComplianceSummaryEntity, { nullable: true })
  complianceSummary: AssociationComplianceSummaryEntity | null;
}
