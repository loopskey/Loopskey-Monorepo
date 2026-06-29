import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ContentType } from "@prisma/client";

@ObjectType(ContentInteractionGqlObjectNames.CONTENT_REVIEW)
export class ContentReviewEntity {
  @Field() userId: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field() contentId: string;
  @Field(() => ID) id: string;
  @Field(() => Int) rating: number;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => String, { nullable: true }) comment?: string | null;
}
