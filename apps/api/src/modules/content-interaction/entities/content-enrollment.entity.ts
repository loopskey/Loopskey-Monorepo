import { ContentEnrollmentStatus, ContentType } from "@prisma/client";
import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(ContentInteractionGqlObjectNames.CONTENT_ENROLLMENT)
export class ContentEnrollmentEntity {
  @Field() userId: string;
  @Field() startedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() contentId: string;
  @Field(() => ID) id: string;
  @Field(() => Int) progress: number;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => Date, { nullable: true }) canceledAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => ContentEnrollmentStatus) status: ContentEnrollmentStatus;
}
