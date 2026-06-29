import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_REPORT_SUMMARY)
export class OrganizationReportSummaryEntity {
  @Field(() => Float) totalPdus: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Float) averagePdus: number;
  @Field(() => Float) requiredHours: number;
  @Field(() => Float) averageCompliance: number;
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_REPORT_TREND_POINT)
export class OrganizationReportTrendPointEntity {
  @Field() date: string;
  @Field() label: string;
  @Field(() => Float) pdus: number;
  @Field(() => Float) compliance: number;
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_REPORT_DEPARTMENT)
export class OrganizationReportDepartmentEntity {
  @Field() departmentTitle: string;
  @Field(() => Int) teamSize: number;
  @Field(() => Float) totalPdus: number;
  @Field(() => Float) compliance: number;
  @Field(() => Float) averagePdus: number;
  @Field(() => ID, { nullable: true }) departmentId?: string | null;
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_REPORT_TOP_MEMBER)
export class OrganizationReportTopMemberEntity {
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Float) pdus: number;
  @Field(() => Float) compliance: number;
  @Field(() => Int) completedLearning: number;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) departmentTitle?: string | null;
}

@ObjectType("PaginatedOrganizationReportTopMembers")
export class PaginatedOrganizationReportTopMembersEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => OrganizationPageInfoEntity) pageInfo: OrganizationPageInfoEntity;
  @Field(() => [OrganizationReportTopMemberEntity])
  items: OrganizationReportTopMemberEntity[];
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_REPORT)
export class OrganizationReportEntity {
  @Field(() => OrganizationReportSummaryEntity)
  summary: OrganizationReportSummaryEntity;
  @Field(() => [OrganizationReportTrendPointEntity])
  complianceTrend: OrganizationReportTrendPointEntity[];
  @Field(() => [OrganizationReportDepartmentEntity])
  departmentCompliance: OrganizationReportDepartmentEntity[];
}
