import { ContentUrlGqlInputNames } from "@contentUrl/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { CONTENT_SLUG_LIMITS } from "@loopskey/api-contracts/validation";
import { ContentUrlNamespace } from "@prisma/client";

import * as V from "class-validator";

import "@contentUrl/enums/content-url-register.enum";

export const RETIRED_SLUG_EVIDENCE_LIMITS = { minLength: 10, maxLength: 1000 };

@InputType(ContentUrlGqlInputNames.ATTACH_RETIRED_SLUG)
export class AttachRetiredContentSlugInput {
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
  retiredSlug: string;

  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(CONTENT_SLUG_LIMITS.maxLength * 2)
  expectedSlug: string;

  @Field()
  @V.IsString()
  @V.MinLength(RETIRED_SLUG_EVIDENCE_LIMITS.minLength)
  @V.MaxLength(RETIRED_SLUG_EVIDENCE_LIMITS.maxLength)
  evidence: string;
}
