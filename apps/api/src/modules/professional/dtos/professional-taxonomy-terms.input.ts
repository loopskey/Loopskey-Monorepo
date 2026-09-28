import { IsEnum } from "class-validator";
import { IsInt } from "class-validator";
import { IsOptional } from "class-validator";
import { IsString } from "class-validator";
import { Max } from "class-validator";
import { MaxLength } from "class-validator";
import { Min } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { ProfileTaxonomyKind } from "@prisma/client";
import { trimToNull } from "@utils/transform.util";
import { Transform } from "class-transformer";

import * as C from "@professional/enums/profile-section.enum";

@InputType(ProfessionalGqlInputNames.PROFESSIONAL_TAXONOMY_TERMS_INPUT)
export class ProfessionalTaxonomyTermsInput {
  @Field(() => ProfileTaxonomyKind)
  @IsEnum(ProfileTaxonomyKind)
  kind: ProfileTaxonomyKind;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(C.TAXONOMY_SEARCH_MAX_LENGTH)
  groupKey?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(C.TAXONOMY_SEARCH_MAX_LENGTH)
  search?: string | null;

  @Field(() => ID, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  cursor?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(C.TAXONOMY_PAGE_MAX)
  take?: number | null;
}
