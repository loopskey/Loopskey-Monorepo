import { Field, ID, InputType, Int, ObjectType } from "@nestjs/graphql";
import { TRANSLATION_DESCRIPTION_MAX_LENGTH } from "@utils/content-translation.util";
import { TRANSLATION_TITLE_MAX_LENGTH } from "@utils/content-translation.util";
import { AppLanguage } from "@prisma/client";

import * as V from "class-validator";

@ObjectType({ isAbstract: true })
export abstract class ContentTranslationEntityBase {
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field() isPublished: boolean;
  @Field(() => Int) version: number;
  @Field(() => AppLanguage) locale: AppLanguage;
  @Field(() => Date, { nullable: true }) publishedAt: Date | null;
}

@InputType({ isAbstract: true })
export abstract class SaveContentTranslationInputBase {
  @Field(() => AppLanguage)
  @V.IsEnum(AppLanguage)
  locale: AppLanguage;

  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(TRANSLATION_TITLE_MAX_LENGTH)
  title: string;

  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(TRANSLATION_DESCRIPTION_MAX_LENGTH)
  description: string;

  @Field(() => Int, { nullable: true })
  @V.IsOptional()
  @V.IsInt()
  @V.Min(1)
  expectedVersion?: number;
}

@InputType({ isAbstract: true })
export abstract class SetContentTranslationPublicationInputBase {
  @Field(() => AppLanguage)
  @V.IsEnum(AppLanguage)
  locale: AppLanguage;

  @Field()
  @V.IsBoolean()
  published: boolean;

  @Field(() => Int)
  @V.IsInt()
  @V.Min(1)
  expectedVersion: number;
}
