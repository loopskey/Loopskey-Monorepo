import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PDUCategory } from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CREDENTIAL)
export class ProfessionalCredentialEntity {
  @Field(() => ID) id: string;
  @Field(() => String) name: string;
  @Field(() => Date) issueDate: Date;
  @Field(() => Date) createdAt: Date;
  @Field(() => Date) updatedAt: Date;
  @Field(() => String) issuingOrganization: string;
  @Field(() => Date, { nullable: true }) expiryDate?: Date | null;
  @Field(() => ID, { nullable: true }) pduTargetId?: string | null;
  @Field(() => String, { nullable: true }) licenceNumber?: string | null;
  @Field(() => Float, { nullable: true }) annualCpdHours?: number | null;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CPD_PLAN)
export class ProfessionalCpdPlanEntity {
  @Field(() => ID) id: string;
  @Field(() => Int) year: number;
  @Field(() => Float) target: number;
  @Field(() => PDUCategory) category: PDUCategory;
}
