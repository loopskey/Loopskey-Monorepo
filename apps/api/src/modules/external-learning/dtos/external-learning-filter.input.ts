import { ExternalLearningGqlInputNames } from "@ext/enums/gql-names.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ExternalLearningProvider } from "@prisma/client";
import { ExternalLearningStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ExternalLearningGqlInputNames.EXTERNAL_LEARNING_FILTER_INPUT)
export class ExternalLearningFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field(() => ExternalLearningStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ExternalLearningStatus)
  status?: ExternalLearningStatus;

  @Field(() => ExternalLearningProvider, { nullable: true })
  @IsOptional()
  @IsEnum(ExternalLearningProvider)
  provider?: ExternalLearningProvider;
}
