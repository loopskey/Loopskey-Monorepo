import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { CreditType } from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.CERTIFICATION_CATEGORY)
export class CertificationCategoryEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => Float) requiredCredits: number;
}

@ObjectType(ProfessionalGqlObjectNames.CERTIFICATION)
export class CertificationEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field() abbreviation: string;
  @Field() organization: string;
  @Field() renewalCycleLabel: string;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => Float) totalRequiredCredits: number;
  @Field(() => String, { nullable: true }) association?: string | null;
  @Field(() => Date, { nullable: true }) suggestedDeadline?: Date | null;
  @Field(() => Int, { nullable: true }) renewalCycleMonths?: number | null;
  @Field(() => String, { nullable: true }) organizationAbbr?: string | null;
  @Field(() => [CertificationCategoryEntity])
  categories: CertificationCategoryEntity[];
}
