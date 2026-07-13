import { LearningBudgetPreference, LearningFormat } from "@prisma/client";
import { ArrayUnique, IsArray, IsEnum, IsOptional } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { LearningTimeCommitment } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_PREFERENCES_INPUT)
export class UpdateProfessionalPreferencesInput {
  @Field(() => [LearningFormat])
  @IsArray()
  @ArrayUnique()
  @IsEnum(LearningFormat, { each: true })
  preferredLearningFormats: LearningFormat[];

  @Field(() => LearningTimeCommitment, { nullable: true })
  @IsOptional()
  @IsEnum(LearningTimeCommitment)
  learningTimeCommitment?: LearningTimeCommitment | null;

  @Field(() => LearningBudgetPreference, { nullable: true })
  @IsOptional()
  @IsEnum(LearningBudgetPreference)
  learningBudgetPreference?: LearningBudgetPreference | null;
}
