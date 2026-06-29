import { OrganizationAccessRequestGqlObjectNames } from "@org/enums/org-access-request-gql-names.enum";
import { OrganizationAccessRequestStatus } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationType } from "@prisma/client";

@ObjectType(OrganizationAccessRequestGqlObjectNames.ORGANIZATION_ACCESS_REQUEST)
export class OrganizationAccessRequestEntity {
  @Field(() => ID) id!: string;
  @Field(() => String) goals!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
  @Field(() => String) country!: string;
  @Field(() => String) workEmail!: string;
  @Field(() => String) organizationName!: string;
  @Field(() => String) representativeJobRole!: string;
  @Field(() => String) representativeFullName!: string;
  @Field(() => Int) expectedLicensedProfessionals!: number;
  @Field(() => Date, { nullable: true }) reviewedAt?: Date | null;
  @Field(() => OrganizationType) organizationType!: OrganizationType;
  @Field(() => String, { nullable: true }) rejectReason?: string | null;
  @Field(() => String, { nullable: true }) reviewedById?: string | null;
  @Field(() => String, { nullable: true }) approvedUserId?: string | null;
  @Field(() => OrganizationAccessRequestStatus)
  status!: OrganizationAccessRequestStatus;
}
