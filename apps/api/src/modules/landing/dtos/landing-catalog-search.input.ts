import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { LandingGqlInputNames } from "@landing/enums/gql-names";
import { ContentType } from "@prisma/client";
import { trimString } from "@common/utils/function-helper";
import { MinLength } from "class-validator";
import { MaxLength } from "class-validator";
import { Transform } from "class-transformer";

@InputType(LandingGqlInputNames.LANDING_CATALOG_SEARCH_INPUT)
export class LandingCatalogSearchInput {
  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  search!: string;

  @Field(() => Int, { nullable: true, defaultValue: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  take?: number;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(50)
  category?: string;
}
