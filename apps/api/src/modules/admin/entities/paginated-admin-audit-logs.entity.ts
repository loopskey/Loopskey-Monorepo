import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { AdminPageInfoEntity } from "@admin/entities/admin-page-info.entity";
import { GraphQLJSONObject } from "graphql-type-json";
import { AuditAction } from "@prisma/client";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_AUDIT_LOG)
export class AdminAuditLogEntity {
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => AuditAction) action: AuditAction;
  @Field(() => ID, { nullable: true }) actorId?: string | null;
  @Field(() => String, { nullable: true }) entityId?: string | null;
  @Field(() => String, { nullable: true }) ipAddress?: string | null;
  @Field(() => String, { nullable: true }) userAgent?: string | null;
  @Field(() => String, { nullable: true }) actorName?: string | null;
  @Field(() => String, { nullable: true }) actorEmail?: string | null;
  @Field(() => String, { nullable: true }) entityType?: string | null;
  @Field(() => GraphQLJSONObject, { nullable: true }) metadata?: Record<
    string,
    unknown
  > | null;
}

@ObjectType(AdminDashboardGqlObjectNames.PAGINATED_ADMIN_AUDIT_LOGS)
export class PaginatedAdminAuditLogsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [AdminAuditLogEntity]) items: AdminAuditLogEntity[];
  @Field(() => AdminPageInfoEntity) pageInfo: AdminPageInfoEntity;
}
