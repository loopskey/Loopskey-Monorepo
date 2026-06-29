import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { AssignmentStatus, AssignmentType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.ORGANIZATION_ASSIGNMENT_FILTER_INPUT,
)
export class OrganizationAssignmentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => AssignmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @Field(() => AssignmentType, { nullable: true })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;
}
