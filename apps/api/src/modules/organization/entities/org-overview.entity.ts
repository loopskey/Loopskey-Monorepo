import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_OVERVIEW_SUMMARY)
export class OrganizationOverviewSummaryEntity {
  @Field(() => Float) totalPdus: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) activeMembers: number;
  @Field(() => Float) engagementRate: number;
  @Field(() => Int) activeAssignments: number;
  @Field(() => Int) nonCompliantMembers: number;
  @Field(() => Float) averageCompliance: number;
}

@ObjectType(
  OrganizationDashboardGqlObjectNames.ORGANIZATION_COMPLIANCE_DISTRIBUTION,
)
export class OrganizationComplianceDistributionEntity {
  @Field(() => Int) atRisk: number;
  @Field(() => Int) compliant: number;
  @Field(() => Int) nonCompliant: number;
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_ATTENTION_MEMBER)
export class OrganizationAttentionMemberEntity {
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Float) pdus: number;
  @Field(() => Float) pduGoal: number;
  @Field(() => Float) compliance: number;
  @Field(() => Float) remainingPdus: number;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => String, { nullable: true }) departmentTitle?: string | null;
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_TRENDING_TOPIC)
export class OrganizationTrendingTopicEntity {
  @Field() title: string;
  @Field(() => Int) count: number;
  @Field(() => Float) percentage: number;
}

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_OVERVIEW)
export class OrganizationOverviewEntity {
  @Field(() => OrganizationOverviewSummaryEntity)
  summary: OrganizationOverviewSummaryEntity;
  @Field(() => OrganizationComplianceDistributionEntity)
  complianceDistribution: OrganizationComplianceDistributionEntity;
  @Field(() => [OrganizationAttentionMemberEntity])
  attentionMembers: OrganizationAttentionMemberEntity[];
  @Field(() => [OrganizationTrendingTopicEntity])
  trendingTopics: OrganizationTrendingTopicEntity[];
}
