import { IsBoolean, IsEnum, IsInt, Max, MaxLength, Min } from "class-validator";
import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { PodcastCategory, PodcastStatus } from "@prisma/client";
import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { IsNotEmpty } from "class-validator";

@InputType(PodcastGqlInputNames.CREATE_PODCAST)
export class CreatePodcastInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  host: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @Field(() => PodcastCategory)
  @IsEnum(PodcastCategory)
  category: PodcastCategory;

  @Field(() => PodcastStatus, {
    nullable: true,
    defaultValue: PodcastStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PodcastStatus)
  status?: PodcastStatus = PodcastStatus.DRAFT;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}
