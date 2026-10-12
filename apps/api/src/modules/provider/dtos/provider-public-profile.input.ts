import { ProviderProfileGqlInputNames } from "@provider/enums/public-profile-gql-names.enum";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { PROVIDER_PROFILE_LIMITS } from "@loopskey/api-contracts/validation";
import { ProviderProfileDecision } from "@provider/enums/public-profile-gql-names.enum";
import { Type } from "class-transformer";

import * as V from "class-validator";

import "@provider/enums/public-profile-register.enum";

@InputType(ProviderProfileGqlInputNames.LINK)
export class ProviderPublicProfileLinkInput {
  @Field()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.linkLabelMax * 2)
  label: string;

  @Field()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.linkUrlMax * 2)
  url: string;
}

@InputType(ProviderProfileGqlInputNames.SAVE)
export class SaveProviderPublicProfileInput {
  @Field()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.displayNameMax * 2)
  displayName: string;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.biographyMax * 2)
  biography?: string | null;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.websiteMax * 2)
  websiteUrl?: string | null;

  @Field(() => [ProviderPublicProfileLinkInput], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(PROVIDER_PROFILE_LIMITS.linksMax * 2)
  @V.ValidateNested({ each: true })
  @Type(() => ProviderPublicProfileLinkInput)
  links?: ProviderPublicProfileLinkInput[];

  @Field(() => ID, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(64)
  logoImageId?: string | null;

  @Field(() => Int, { nullable: true })
  @V.IsOptional()
  @V.IsInt()
  @V.Min(1)
  expectedVersion?: number;
}

@InputType(ProviderProfileGqlInputNames.SUBMIT)
export class SubmitProviderPublicProfileInput {
  @Field(() => Int)
  @V.IsInt()
  @V.Min(1)
  expectedVersion: number;
}

@InputType(ProviderProfileGqlInputNames.REVIEW)
export class ReviewProviderPublicProfileInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  profileId: string;

  @Field(() => ProviderProfileDecision)
  @V.IsEnum(ProviderProfileDecision)
  decision: ProviderProfileDecision;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.noteMax * 2)
  note?: string | null;

  @Field(() => Int)
  @V.IsInt()
  @V.Min(1)
  expectedDraftVersion: number;
}

@InputType(ProviderProfileGqlInputNames.MODERATE)
export class ModerateProviderPublicProfileInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  profileId: string;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(PROVIDER_PROFILE_LIMITS.noteMax * 2)
  note?: string | null;
}

@InputType(ProviderProfileGqlInputNames.SET_INDEX_EXCLUSION)
export class SetProviderPublicProfileIndexExclusionInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  profileId: string;

  @Field()
  @V.IsBoolean()
  excluded: boolean;
}
