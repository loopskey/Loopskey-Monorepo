import { ExternalLearningGqlObjectNames } from "@ext/enums/gql-names.enum";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { ExternalLearningProvider } from "@prisma/client";
import { ExternalLearningStatus } from "@prisma/client";

@ObjectType(ExternalLearningGqlObjectNames.EXTERNAL_LEARNING_ACTIVITY)
export class ExternalLearningActivityEntity {
  @Field() title: string;
  @Field() clickedAt: Date;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field() externalUrl: string;
  @Field(() => ID) userId: string;
  @Field(() => ID, { nullable: true }) eventId?: string | null;
  @Field(() => ID, { nullable: true }) courseId?: string | null;
  @Field(() => Date, { nullable: true }) startedAt?: Date | null;
  @Field(() => Date, { nullable: true }) verifiedAt?: Date | null;
  @Field(() => Date, { nullable: true }) rejectedAt?: Date | null;
  @Field(() => Date, { nullable: true }) remindedAt?: Date | null;
  @Field(() => Date, { nullable: true }) confirmedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => Float, { nullable: true }) pduHours?: number | null;
  @Field(() => ExternalLearningStatus) status: ExternalLearningStatus;
  @Field(() => String, { nullable: true }) rejectReason?: string | null;
  @Field(() => String, { nullable: true }) evidenceNote?: string | null;
  @Field(() => String, { nullable: true }) licenseNumber?: string | null;
  @Field(() => String, { nullable: true }) certificateUrl?: string | null;
  @Field(() => ExternalLearningProvider) provider: ExternalLearningProvider;
}
