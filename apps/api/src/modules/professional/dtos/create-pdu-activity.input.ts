import { ContentType, PDUCategory, PDUSource } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, Min } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, Float, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType(ProfessionalGqlInputNames.CREATE_PDU_ACTIVITY_INPUT)
export class CreatePduActivityInput {
  @Field() @IsString() title: string;
  @Field() @IsDateString() date: string;
  @Field(() => Float) @IsNumber() @Min(0) pdus: number;
  @Field(() => PDUSource) @IsEnum(PDUSource) source: PDUSource;
  @Field(() => PDUCategory) @IsEnum(PDUCategory) category: PDUCategory;
  @Field({ nullable: true }) @IsOptional() @IsString() contentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() evidenceUrl?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
