import { AssignmentTargetKind, AssignmentType, Role } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.CREATE_ORGANIZATION_ASSIGNMENT_INPUT,
)
export class CreateOrganizationAssignmentInput {
  @Field() @IsString() title: string;
  @Field({ nullable: true }) @IsOptional() @IsString() eventId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() courseId?: string;
  @Field(() => AssignmentType) @IsEnum(AssignmentType) type: AssignmentType;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() dueDate?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() targetMemberId?: string;

  @Field(() => AssignmentTargetKind)
  @IsEnum(AssignmentTargetKind)
  targetKind: AssignmentTargetKind;

  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;
}
