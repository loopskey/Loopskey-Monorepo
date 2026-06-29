import { ContentInteractionGqlInputNames } from "../enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { ContentType } from "@prisma/client";

@InputType(ContentInteractionGqlInputNames.CONTENT_ACTION)
export class ContentActionInput {
  @Field() @IsString() contentId: string;
  @Field(() => ContentType) @IsEnum(ContentType) contentType: ContentType;
}
