import { IsEnum, IsUrl, Max, MaxLength, Min } from "class-validator";
import { ExternalLearningGqlInputNames } from "@ext/enums/gql-names.enum";
import { Field, Float, InputType } from "@nestjs/graphql";
import { ExternalLearningStatus } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

@InputType(ExternalLearningGqlInputNames.CONFIRM_EXTERNAL_LEARNING_INPUT)
export class ConfirmExternalLearningInput {
  @Field() @IsString() activityId: string;
  @Field(() => ExternalLearningStatus)
  @IsEnum(ExternalLearningStatus)
  status: ExternalLearningStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(1000)
  pduHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  certificateUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  licenseNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  evidenceNote?: string;
}
