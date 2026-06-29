import { ExternalLearningGqlInputNames } from "@ext/enums/gql-names.enum";
import { ExternalLearningProvider } from "@prisma/client";
import { IsEnum, IsUrl, MaxLength } from "class-validator";
import { IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ExternalLearningGqlInputNames.CREATE_EXTERNAL_LEARNING_CLICK_INPUT)
export class CreateExternalLearningClickInput {
  @Field() @IsString() @MaxLength(200) title: string;
  @Field() @IsUrl({ require_protocol: true }) externalUrl: string;
  @Field({ nullable: true }) @IsOptional() @IsString() eventId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() courseId?: string;
  @Field(() => ExternalLearningProvider, { nullable: true })
  @IsOptional()
  @IsEnum(ExternalLearningProvider)
  provider?: ExternalLearningProvider;
}
