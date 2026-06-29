import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { AssignmentStatus, AssignmentTargetKind } from "@prisma/client";
import { AssignmentType, Role } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateOrganizationAssignmentInput {
  @Field() @IsString() assignmentId: string;
  @Field({ nullable: true }) @IsOptional() @IsString() title?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() eventId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() courseId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() dueDate?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() targetMemberId?: string;

  @Field(() => AssignmentType, { nullable: true })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @Field(() => AssignmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @Field(() => AssignmentTargetKind, { nullable: true })
  @IsOptional()
  @IsEnum(AssignmentTargetKind)
  targetKind?: AssignmentTargetKind;

  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;
}
