import { IsEnum, IsInt, IsString, Max, Min } from "class-validator";
import { ContentInteractionGqlInputNames } from "@contentAction/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { ContentType } from "@prisma/client";

@InputType(ContentInteractionGqlInputNames.UPDATE_ENROLLMENT_PROGRESS)
export class UpdateEnrollmentProgressInput {
  @Field() @IsString() contentId: string;
  @Field(() => Int) @IsInt() @Min(0) @Max(100) progress: number;
  @Field(() => ContentType) @IsEnum(ContentType) contentType: ContentType;
}
