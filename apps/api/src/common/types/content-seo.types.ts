import { Field, ID, InputType, Int, ObjectType } from "@nestjs/graphql";
import { SEO_DESCRIPTION_MAX_LENGTH } from "@utils/content-seo.util";
import { SEO_IMAGE_ALT_MAX_LENGTH } from "@utils/content-seo.util";
import { SEO_IMAGE_ID_MAX_LENGTH } from "@utils/content-seo.util";
import { SEO_TITLE_MAX_LENGTH } from "@utils/content-seo.util";
import { AppLanguage } from "@prisma/client";

import * as V from "class-validator";

export enum ContentSeoGqlNames {
  LOCALE = "ContentSeoLocale",
  SETTINGS = "ContentSeoSettings",
  SAVE_INPUT = "SaveContentSeoInput",
  SET_INDEX_EXCLUSION_INPUT = "SetContentIndexExclusionInput",
}

@ObjectType(ContentSeoGqlNames.LOCALE)
export class ContentSeoLocaleEntity {
  @Field(() => AppLanguage) locale: AppLanguage;
  @Field(() => Int) version: number;
  @Field(() => String, { nullable: true }) seoTitle: string | null;
  @Field(() => String, { nullable: true }) seoDescription: string | null;
  @Field(() => String, { nullable: true }) socialImageId: string | null;
  @Field(() => String, { nullable: true }) socialImagePath: string | null;
  @Field(() => String, { nullable: true }) socialImageAlt: string | null;
  @Field() defaultTitle: string;
  @Field(() => String, { nullable: true }) defaultDescription: string | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType(ContentSeoGqlNames.SETTINGS)
export class ContentSeoSettingsEntity {
  @Field() excludeFromIndex: boolean;
  @Field(() => [ContentSeoLocaleEntity]) locales: ContentSeoLocaleEntity[];
}

@InputType(ContentSeoGqlNames.SAVE_INPUT)
export class SaveContentSeoInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  contentId: string;

  @Field(() => AppLanguage)
  @V.IsEnum(AppLanguage)
  locale: AppLanguage;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(SEO_TITLE_MAX_LENGTH)
  seoTitle?: string | null;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(SEO_DESCRIPTION_MAX_LENGTH)
  seoDescription?: string | null;

  @Field(() => ID, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(SEO_IMAGE_ID_MAX_LENGTH)
  socialImageId?: string | null;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(SEO_IMAGE_ALT_MAX_LENGTH)
  socialImageAlt?: string | null;

  @Field(() => Int, { nullable: true })
  @V.IsOptional()
  @V.IsInt()
  @V.Min(1)
  expectedVersion?: number;
}

@InputType(ContentSeoGqlNames.SET_INDEX_EXCLUSION_INPUT)
export class SetContentIndexExclusionInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  contentId: string;

  @Field()
  @V.IsBoolean()
  excluded: boolean;
}
