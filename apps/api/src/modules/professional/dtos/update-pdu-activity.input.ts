import { PDUCategory, PDUCompletionStatus, PDUSource } from "@prisma/client";
import { ContentType, CreditType, PDUStatus } from "@prisma/client";
import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, IsPositive } from "class-validator";
import { IsString, Max, MaxLength, Min } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { IsDateString, IsEnum } from "class-validator";

@InputType(ProfessionalGqlInputNames.UPDATE_PDU_ACTIVITY_INPUT)
export class UpdatePduActivityInput {
  @Field(() => ID) @IsString() activityId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true }) @IsOptional() @IsDateString() date?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() contentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() evidenceUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  pdus?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  reportingYear?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  providerOrganizer?: string;

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

  @Field(() => PDUSource, { nullable: true })
  @IsOptional()
  @IsEnum(PDUSource)
  source?: PDUSource;

  @Field(() => PDUCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCategory)
  category?: PDUCategory;

  @Field(() => CreditType, { nullable: true })
  @IsOptional()
  @IsEnum(CreditType)
  creditType?: CreditType;

  @Field(() => PDUCompletionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCompletionStatus)
  completionStatus?: PDUCompletionStatus;

  @Field(() => PDUStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PDUStatus)
  status?: PDUStatus;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
