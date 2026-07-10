import { IsOptional, IsString, MaxLength } from "class-validator";
import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsDateString, IsEnum, IsInt } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { ContentType, CreditType } from "@prisma/client";
import { PDUCategory, PDUSource } from "@prisma/client";
import { IsPositive, Max, Min } from "class-validator";

@InputType(ProfessionalGqlInputNames.CREATE_PDU_ACTIVITY_INPUT)
export class CreatePduActivityInput {
  @Field() @IsString() @MaxLength(200) title: string;
  @Field() @IsDateString() date: string;
  @Field(() => Float) @IsPositive() pdus: number;
  @Field(() => PDUSource) @IsEnum(PDUSource) source: PDUSource;
  @Field(() => PDUCategory) @IsEnum(PDUCategory) category: PDUCategory;
  @Field(() => CreditType) @IsEnum(CreditType) creditType: CreditType;

  @Field(() => Int)
  @IsInt()
  @Min(1900)
  @Max(2200)
  reportingYear: number;

  @Field() @IsString() @MaxLength(200) providerOrganizer: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  learningOutcome?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  subCategory?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuingOrganization?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  relatedCertification?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  evidenceNote?: string;

  @Field({ nullable: true }) @IsOptional() @IsString() contentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() evidenceUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
