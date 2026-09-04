import { PaginatedAssociationRenewalReadinessEntity } from "@association/entities/association-report.entity";
import { PaginatedAssociationMissingEvidenceEntity } from "@association/entities/association-report.entity";
import { PaginatedAssociationMemberProgressEntity } from "@association/entities/association-report.entity";
import { AssociationComplianceTrendPointEntity } from "@association/entities/association-report.entity";
import { AssociationCategoryProgressRowEntity } from "@association/entities/association-report.entity";
import { AssociationMemberDistributionEntity } from "@association/entities/association-report.entity";
import { AssociationGroupProgressRowEntity } from "@association/entities/association-report.entity";
import { AssociationGroupComplianceEntity } from "@association/entities/association-report.entity";
import { AssociationReportSummaryEntity } from "@association/entities/association-report.entity";
import { Args, ID, Query, Resolver } from "@nestjs/graphql";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-report.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationReportResolver {
  constructor(private readonly reports: AssociationReportService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => AssociationReportSummaryEntity, {
    name: AssociationGqlQueryNames.REPORT_SUMMARY,
  })
  associationReportSummary(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.summary(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => [AssociationGroupComplianceEntity], {
    name: AssociationGqlQueryNames.COMPLIANCE_BY_GROUP,
  })
  associationComplianceByGroup(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.complianceByGroup(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => [AssociationCategoryProgressRowEntity], {
    name: AssociationGqlQueryNames.PROGRESS_BY_CATEGORY,
  })
  associationProgressByCategory(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.progressByCategory(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => AssociationMemberDistributionEntity, {
    name: AssociationGqlQueryNames.MEMBER_DISTRIBUTION,
  })
  associationMemberDistribution(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.memberDistribution(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => [AssociationComplianceTrendPointEntity], {
    name: AssociationGqlQueryNames.COMPLIANCE_TREND,
  })
  associationComplianceTrend(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.complianceTrend(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => PaginatedAssociationMemberProgressEntity, {
    name: AssociationGqlQueryNames.MEMBER_PROGRESS_REPORT,
  })
  associationMemberProgressReport(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: DTO.AssociationReportPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.memberProgressReport(
      this.getUser(user),
      filter ?? {},
      pagination,
      associationId,
    );
  }

  @Query(() => [AssociationGroupProgressRowEntity], {
    name: AssociationGqlQueryNames.GROUP_PROGRESS_REPORT,
  })
  associationGroupProgressReport(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.groupProgressReport(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => [AssociationCategoryProgressRowEntity], {
    name: AssociationGqlQueryNames.CATEGORY_COMPLETION_REPORT,
  })
  associationCategoryCompletionReport(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.categoryCompletionReport(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => PaginatedAssociationMissingEvidenceEntity, {
    name: AssociationGqlQueryNames.MISSING_EVIDENCE_REPORT,
  })
  associationMissingEvidenceReport(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: DTO.AssociationReportPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.missingEvidenceReport(
      this.getUser(user),
      filter ?? {},
      pagination,
      associationId,
    );
  }

  @Query(() => PaginatedAssociationRenewalReadinessEntity, {
    name: AssociationGqlQueryNames.RENEWAL_READINESS_REPORT,
  })
  associationRenewalReadinessReport(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationReportFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: DTO.AssociationReportPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reports.renewalReadinessReport(
      this.getUser(user),
      filter ?? {},
      pagination,
      associationId,
    );
  }
}
