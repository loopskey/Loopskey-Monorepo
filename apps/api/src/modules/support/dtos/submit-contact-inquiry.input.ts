import { IsEnum, IsOptional, IsString } from "class-validator";
import { IsEmail, Length, MaxLength } from "class-validator";
import { ContactInquiryType } from "@support/enums/contact-inquiry.enum";
import { Field, InputType } from "@nestjs/graphql";
import { ContactGqlNames } from "@support/enums/contact-inquiry.enum";
import { Transform } from "class-transformer";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

@InputType(ContactGqlNames.SUBMIT_CONTACT_INQUIRY_INPUT)
export class SubmitContactInquiryInput {
  @Field(() => String)
  @Transform(trim)
  @IsString()
  @Length(2, 120)
  fullName!: string;

  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @Length(2, 160)
  organization?: string;

  @Field(() => ContactInquiryType)
  @IsEnum(ContactInquiryType)
  inquiryType!: ContactInquiryType;

  @Field(() => String)
  @Transform(trim)
  @IsString()
  @Length(10, 5000)
  message!: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}
