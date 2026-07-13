import { IsEnum, IsOptional, IsString, Length, Matches } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { AppLanguage } from "@prisma/client";
import { IsTimeZone } from "@professional/enums/profile-timezone.constant";
import { trimToNull } from "@utils/functions-helper";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_BASIC_PROFILE_INPUT)
export class UpdateProfessionalBasicProfileInput {
  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(2, 120)
  fullName: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/(www\.)?linkedin\.com\/.+$/i, {
    message: "linkedInUrl must be a valid LinkedIn profile URL.",
  })
  linkedInUrl?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim().toUpperCase();
    return trimmed.length > 0 ? trimmed : null;
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: "countryCode must be an ISO 3166-1 alpha-2 code.",
  })
  countryCode?: string | null;

  @Field(() => AppLanguage, { nullable: true })
  @IsOptional()
  @IsEnum(AppLanguage)
  language?: AppLanguage | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsTimeZone()
  timeZone?: string | null;
}
