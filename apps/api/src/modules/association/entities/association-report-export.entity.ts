import { AssociationGeneratedReportState } from "@prisma/client";
import { AssociationReportFormat, AssociationReportType } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_GENERATED_REPORT_FILTER)
export class AssociationGeneratedReportFilterEntity {
  @Field(() => AssociationReportPeriod) period: AssociationReportPeriod;
  @Field() includeInactive: boolean;
  @Field(() => String, { nullable: true }) endDate: string | null;
  @Field(() => String, { nullable: true }) startDate: string | null;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => ID, { nullable: true }) requirementId: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_GENERATED_REPORT)
export class AssociationGeneratedReportEntity {
  @Field(() => ID) id: string;
  @Field() fileName: string;
  @Field() createdAt: Date;
  @Field(() => AssociationReportType) reportType: AssociationReportType;
  @Field(() => AssociationReportFormat) format: AssociationReportFormat;
  @Field(() => AssociationGeneratedReportState)
  state: AssociationGeneratedReportState;
  @Field(() => AssociationGeneratedReportFilterEntity)
  filter: AssociationGeneratedReportFilterEntity;
  @Field(() => Int, { nullable: true }) sizeBytes: number | null;
  @Field(() => Int, { nullable: true }) rowCount: number | null;
  @Field(() => String, { nullable: true }) failureReason: string | null;
  @Field(() => Date, { nullable: true }) readyAt: Date | null;
  @Field(() => Date, { nullable: true }) expiresAt: Date | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_GENERATED_REPORTS)
export class PaginatedAssociationGeneratedReportsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationGeneratedReportEntity])
  items: AssociationGeneratedReportEntity[];
}
