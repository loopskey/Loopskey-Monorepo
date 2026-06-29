import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ContentInteractionGqlInputNames } from "@contentAction/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { ContentType } from "@prisma/client";

@InputType(ContentInteractionGqlInputNames.SUBMIT_CONTENT_REVIEW)
export class SubmitContentReviewInput {
  @Field() @IsString() contentId: string;
  @Field(() => Int) @IsInt() @Min(1) @Max(5) rating: number;
  @Field(() => ContentType) @IsEnum(ContentType) contentType: ContentType;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}
