import { PaginatedAssociationGeneratedReportsEntity } from "@association/entities/association-report-export.entity";
import { AssociationGeneratedReportEntity } from "@association/entities/association-report-export.entity";
import { AssociationReportExportService } from "@association/services/association-report-export.service";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationReportPaginationInput } from "@association/dtos/association-report.input";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-report-export.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationReportExportResolver {
  constructor(private readonly exports: AssociationReportExportService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => PaginatedAssociationGeneratedReportsEntity, {
    name: AssociationGqlQueryNames.GENERATED_REPORTS,
  })
  associationGeneratedReports(
    @CurrentUser() user: TResolverUser,
    @Args("pagination", { nullable: true })
    pagination?: AssociationReportPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.exports.list(this.getUser(user), pagination, associationId);
  }

  @Query(() => AssociationGeneratedReportEntity, {
    name: AssociationGqlQueryNames.GENERATED_REPORT,
  })
  associationGeneratedReport(
    @CurrentUser() user: TResolverUser,
    @Args("exportId", { type: () => ID }) exportId: string,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.exports.findOne(this.getUser(user), exportId, associationId);
  }

  @Mutation(() => AssociationGeneratedReportEntity, {
    name: AssociationGqlMutationNames.REQUEST_REPORT_EXPORT,
  })
  @Roles(Role.ASSOCIATION)
  requestAssociationReportExport(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.RequestAssociationReportExportInput,
  ) {
    return this.exports.request(this.getUser(user), {
      locale: input.locale,
      format: input.format,
      reportType: input.reportType,
      filter: input.filter ?? {},
    });
  }

  @Mutation(() => AssociationGeneratedReportEntity, {
    name: AssociationGqlMutationNames.RETRY_REPORT_EXPORT,
  })
  @Roles(Role.ASSOCIATION)
  retryAssociationReportExport(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.AssociationReportExportIdInput,
  ) {
    return this.exports.retry(this.getUser(user), input.exportId);
  }
}
