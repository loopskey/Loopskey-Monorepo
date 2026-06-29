import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AuditAction } from "@prisma/client";
import { GraphQLJSON } from "graphql-type-json";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_AUDIT_LOG)
export class AdminAuditLogEntity {
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => AuditAction) action: AuditAction;
  @Field(() => String, { nullable: true }) actorId?: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) metadata?: unknown;
  @Field(() => String, { nullable: true }) entityId?: string | null;
  @Field(() => String, { nullable: true }) actorEmail?: string | null;
  @Field(() => String, { nullable: true }) entityType?: string | null;
}
