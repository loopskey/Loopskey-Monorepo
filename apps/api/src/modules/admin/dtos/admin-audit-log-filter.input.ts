import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { AuditAction } from "@prisma/client";

@InputType(AdminDashboardGqlInputNames.ADMIN_AUDIT_LOG_FILTER)
export class AdminAuditLogFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => AuditAction, { nullable: true })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  to?: string;
}
