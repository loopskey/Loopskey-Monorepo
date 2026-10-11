import { ContentUrlGqlInputNames } from "@contentUrl/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { CONTENT_SLUG_LIMITS } from "@loopskey/api-contracts/validation";
import { ContentUrlNamespace } from "@prisma/client";

import * as V from "class-validator";

import "@contentUrl/enums/content-url-register.enum";

@InputType(ContentUrlGqlInputNames.CHANGE_SLUG)
export class ChangeContentSlugInput {
  @Field(() => ContentUrlNamespace)
  @V.IsEnum(ContentUrlNamespace)
  kind: ContentUrlNamespace;

  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  contentId: string;

  @Field()
  @V.IsString()
  @V.MaxLength(CONTENT_SLUG_LIMITS.maxLength * 2)
  slug: string;

  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(CONTENT_SLUG_LIMITS.maxLength * 2)
  expectedSlug: string;
}
