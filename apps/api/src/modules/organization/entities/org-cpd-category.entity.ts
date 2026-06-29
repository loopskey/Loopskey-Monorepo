import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { PDUCategory } from "@prisma/client";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_CPD_CATEGORY)
export class OrganizationCpdCategoryEntity {
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field() isActive: boolean;
  @Field(() => ID) id: string;
  @Field(() => ID) organizationId: string;
  @Field(() => Float) requiredHours: number;
  @Field(() => PDUCategory) category: PDUCategory;
  @Field(() => Int, { nullable: true }) totalMembers?: number;
  @Field(() => Int, { nullable: true }) activeMembers?: number;
  @Field(() => String, { nullable: true }) description?: string | null;
}
