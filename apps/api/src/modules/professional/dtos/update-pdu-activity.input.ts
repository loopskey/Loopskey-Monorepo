import { ContentType, PDUCategory, PDUSource, PDUStatus } from "@prisma/client";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Field, Float, ID, InputType } from "@nestjs/graphql";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { IsDateString, IsEnum } from "class-validator";

@InputType(ProfessionalGqlInputNames.UPDATE_PDU_ACTIVITY_INPUT)
export class UpdatePduActivityInput {
  @Field(() => ID) @IsString() activityId: string;
  @Field({ nullable: true }) @IsOptional() @IsString() title?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() date?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() contentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() evidenceUrl?: string;
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pdus?: number;
  @Field(() => PDUSource, { nullable: true })
  @IsOptional()
  @IsEnum(PDUSource)
  source?: PDUSource;
  @Field(() => PDUCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCategory)
  category?: PDUCategory;
  @Field(() => PDUStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PDUStatus)
  status?: PDUStatus;
  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
