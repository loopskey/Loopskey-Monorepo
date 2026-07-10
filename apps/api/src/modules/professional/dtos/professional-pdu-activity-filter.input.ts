import { IsBoolean, IsDateString, IsEnum } from "class-validator";
import { PDUCompletionStatus, PDUSource } from "@prisma/client";
import { IsInt, IsOptional, IsString } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { CreditType, PDUCategory } from "@prisma/client";
import { Field, InputType, Int } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.PROFESSIONAL_PDU_ACTIVITY_FILTER_INPUT)
export class ProfessionalPduActivityFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;

  @Field(() => PDUSource, { nullable: true })
  @IsOptional()
  @IsEnum(PDUSource)
  activityType?: PDUSource;

  @Field(() => CreditType, { nullable: true })
  @IsOptional()
  @IsEnum(CreditType)
  creditType?: CreditType;

  @Field(() => PDUCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCategory)
  category?: PDUCategory;

  @Field(() => PDUCompletionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCompletionStatus)
  completionStatus?: PDUCompletionStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  reportingYear?: number;

  @Field({ nullable: true }) @IsOptional() @IsDateString() dateFrom?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() dateTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean;
}
