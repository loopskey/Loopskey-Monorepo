import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsEnum, IsInt, IsNumber, Min } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { PDUCategory } from "@prisma/client";

@InputType(ProfessionalGqlInputNames.UPSERT_PDU_TARGET_INPUT)
export class UpsertPduTargetInput {
  @Field(() => Int) @IsInt() year: number;
  @Field(() => Float) @IsNumber() @Min(0) target: number;
  @Field(() => PDUCategory) @IsEnum(PDUCategory) category: PDUCategory;
}
