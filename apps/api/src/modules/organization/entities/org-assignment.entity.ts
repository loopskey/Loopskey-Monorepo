import { AssignmentStatus, AssignmentType, Role } from "@prisma/client";
import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssignmentTargetKind } from "@prisma/client";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_ASSIGNMENT)
export class OrganizationAssignmentEntity {
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => Int) members: number;
  @Field(() => ID) createdById: string;
  @Field(() => Float) progress: number;
  @Field(() => ID) organizationId: string;
  @Field(() => AssignmentType) type: AssignmentType;
  @Field(() => AssignmentStatus) status: AssignmentStatus;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Role, { nullable: true }) targetRole?: Role | null;
  @Field(() => String, { nullable: true }) eventId?: string | null;
  @Field(() => String, { nullable: true }) courseId?: string | null;
  @Field(() => String, { nullable: true }) eventTitle?: string | null;
  @Field(() => AssignmentTargetKind) targetKind: AssignmentTargetKind;
  @Field(() => String, { nullable: true }) courseTitle?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) departmentId?: string | null;
  @Field(() => String, { nullable: true }) targetMemberId?: string | null;
}
