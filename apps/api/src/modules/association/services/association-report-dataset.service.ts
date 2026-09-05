import {
  AssociationComplianceBand,
  AssociationReportType,
} from "@prisma/client";
import { type ExportColumn } from "@association/types/association-report-export.types";
import { type ExportEntry } from "@association/types/association-report-export.types";
import { type ExportRow } from "@association/types/association-report-export.types";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationReportService } from "@association/services/association-report.service";
import { BadRequestException } from "@nestjs/common";
import { type ReportExportDataset } from "@association/types/association-report-export.types";
import { type ExportTranslator } from "@association/utils/association-report-export-labels.util";
import { exportTranslator } from "@association/utils/association-report-export-labels.util";
import { type ExportLocale } from "@association/utils/association-report-export.util";
import { EXPORT_ROW_LIMIT } from "@association/utils/association-report-export.util";
import { type TAssociationUser } from "@association/types/association-service.types";
import { type ReportFilter } from "@association/services/association-report.service";
import { exportFormatter } from "@association/utils/association-report-export-format.util";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

const BAND_ORDER = [
  AssociationComplianceBand.RENEWAL_READY,
  AssociationComplianceBand.ON_TRACK,
  AssociationComplianceBand.AT_RISK,
  AssociationComplianceBand.NOT_STARTED,
] as const;

const page = { take: EXPORT_ROW_LIMIT };

type ReportSummary = Awaited<ReturnType<AssociationReportService["summary"]>>;

@Injectable()
export class AssociationReportDatasetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: AssociationReportService,
  ) {}

  async build(
    user: TAssociationUser,
    reportType: AssociationReportType,
    filter: ReportFilter,
    locale: ExportLocale,
  ): Promise<ReportExportDataset> {
    const t = exportTranslator(locale);
    const format = exportFormatter(locale, t("value.none"));

    const summary = await this.reports.summary(user, filter);
    const table = await this.table(user, reportType, filter, summary, t);

    const summaryEntries: ExportEntry[] = [
      {
        label: t("summary.totalMembers"),
        value: format.number(summary.totalMembers),
      },
      {
        label: t("summary.renewalReady"),
        value: `${format.number(summary.renewalReady)} (${format.percent(summary.renewalReadyShare)})`,
      },
      {
        label: t("summary.onTrack"),
        value: `${format.number(summary.onTrack)} (${format.percent(summary.onTrackShare)})`,
      },
      {
        label: t("summary.atRisk"),
        value: `${format.number(summary.atRisk)} (${format.percent(summary.atRiskShare)})`,
      },
      {
        label: t("summary.missingEvidence"),
        value: `${format.number(summary.missingEvidence)} (${format.percent(summary.missingEvidenceShare)})`,
      },
      {
        label: t("summary.averageCompletion"),
        value: format.percent(summary.averageCompletion),
      },
      {
        label: t("summary.period"),
        value: `${format.date(summary.periodStart)} - ${format.date(summary.periodEnd)}`,
      },
      {
        label: t("summary.computedAt"),
        value: format.date(summary.computedAt),
      },
    ];

    return {
      title: t(`report.${reportType}`),
      answer: t(`answer.${reportType}`),
      columns: table.columns,
      rows: table.rows.slice(0, EXPORT_ROW_LIMIT),
      summary: summaryEntries,
      filterLines: await this.filterLines(filter, summary, t, format.date),
      totalRows: table.total,
      isTruncated: table.total > EXPORT_ROW_LIMIT,
    };
  }

  private async table(
    user: TAssociationUser,
    reportType: AssociationReportType,
    filter: ReportFilter,
    summary: ReportSummary,
    t: ExportTranslator,
  ): Promise<{ columns: ExportColumn[]; rows: ExportRow[]; total: number }> {
    const yesNo = (value: boolean) => t(value ? "value.yes" : "value.no");

    if (reportType === AssociationReportType.OVERVIEW_SUMMARY) {
      const distribution = await this.reports.memberDistribution(user, filter);

      const counts: Record<AssociationComplianceBand, number> = {
        RENEWAL_READY: distribution.renewalReady,
        ON_TRACK: distribution.onTrack,
        AT_RISK: distribution.atRisk,
        NOT_STARTED: distribution.notStarted,
      };

      const shares: Record<AssociationComplianceBand, number> = {
        RENEWAL_READY: distribution.renewalReadyShare,
        ON_TRACK: distribution.onTrackShare,
        AT_RISK: distribution.atRiskShare,
        NOT_STARTED: distribution.notStartedShare,
      };

      const changes: Record<AssociationComplianceBand, number | null> = {
        RENEWAL_READY: summary.renewalReadyChange,
        ON_TRACK: summary.onTrackChange,
        AT_RISK: summary.atRiskChange,
        NOT_STARTED: null,
      };

      const rows = BAND_ORDER.map((band) => ({
        band: t(`band.${band}`),
        members: counts[band],
        share: shares[band],
        change: changes[band],
      }));

      return {
        rows,
        total: rows.length,
        columns: [
          { key: "band", label: t("column.band"), kind: "text", weight: 3 },
          {
            key: "members",
            label: t("column.members"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "share",
            label: t("column.share"),
            kind: "percent",
            weight: 2,
          },
          {
            key: "change",
            label: t("column.change"),
            kind: "integer",
            weight: 2,
          },
        ],
      };
    }

    if (reportType === AssociationReportType.MEMBER_PROGRESS) {
      const result = await this.reports.memberProgressReport(
        user,
        filter,
        page,
      );

      return {
        total: result.totalCount,
        rows: result.items.map((row) => ({
          member: row.fullName,
          email: row.email,
          memberNumber: row.memberNumber,
          group: row.groupTitle,
          band: t(`band.${row.band}`),
          completion: row.percent,
          requiredCredits: row.requiredCredits,
          completedCredits: row.completedCredits,
          awaiting: row.awaitingReviewCount,
          missingEvidence: yesNo(row.isMissingEvidence),
          deadline: row.earliestUnmetDeadline,
        })),
        columns: [
          { key: "member", label: t("column.member"), kind: "text", weight: 4 },
          { key: "email", label: t("column.email"), kind: "text", weight: 5 },
          {
            key: "memberNumber",
            label: t("column.memberNumber"),
            kind: "text",
            weight: 3,
          },
          { key: "group", label: t("column.group"), kind: "text", weight: 3 },
          { key: "band", label: t("column.band"), kind: "text", weight: 3 },
          {
            key: "completion",
            label: t("column.completion"),
            kind: "percent",
            weight: 2,
          },
          {
            key: "requiredCredits",
            label: t("column.requiredCredits"),
            kind: "decimal",
            weight: 2,
          },
          {
            key: "completedCredits",
            label: t("column.completedCredits"),
            kind: "decimal",
            weight: 2,
          },
          {
            key: "awaiting",
            label: t("column.awaiting"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "missingEvidence",
            label: t("column.missingEvidence"),
            kind: "text",
            weight: 2,
          },
          {
            key: "deadline",
            label: t("column.deadline"),
            kind: "date",
            weight: 3,
          },
        ],
      };
    }

    if (reportType === AssociationReportType.GROUP_PROGRESS) {
      const rows = await this.reports.groupProgressReport(user, filter);

      return {
        total: rows.length,
        rows: rows.map((row) => ({
          group: row.groupTitle,
          members: row.memberCount,
          averageCompletion: row.averageCompletion,
          renewalReady: row.renewalReady,
          onTrack: row.onTrack,
          atRisk: row.atRisk,
          notStarted: row.notStarted,
          neverStarted: row.notStartedCount,
          missingEvidence: row.missingEvidenceCount,
        })),
        columns: [
          { key: "group", label: t("column.group"), kind: "text", weight: 4 },
          {
            key: "members",
            label: t("column.members"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "averageCompletion",
            label: t("column.averageCompletion"),
            kind: "percent",
            weight: 3,
          },
          {
            key: "renewalReady",
            label: t("column.renewalReady"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "onTrack",
            label: t("column.onTrack"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "atRisk",
            label: t("column.atRisk"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "notStarted",
            label: t("column.notStarted"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "neverStarted",
            label: t("column.neverStarted"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "missingEvidence",
            label: t("column.missingEvidence"),
            kind: "integer",
            weight: 2,
          },
        ],
      };
    }

    if (reportType === AssociationReportType.CATEGORY_COMPLETION) {
      const rows = await this.reports.categoryCompletionReport(user, filter);

      return {
        total: rows.length,
        rows: rows.map((row) => ({
          category: row.categoryName,
          requirement: row.requirementName,
          mappedCategory: row.mappedCategory,
          requiredCredits: row.requiredCredits,
          averageEarned: row.averageCompletedCredits,
          completion: row.averagePercent,
          members: row.memberCount,
          belowHalf: row.belowHalfCount,
          behind: row.behindCount,
          onTrack: row.onTrackCount,
          atRisk: row.atRiskCount,
        })),
        columns: [
          {
            key: "category",
            label: t("column.category"),
            kind: "text",
            weight: 4,
          },
          {
            key: "requirement",
            label: t("column.requirement"),
            kind: "text",
            weight: 4,
          },
          {
            key: "mappedCategory",
            label: t("column.mappedCategory"),
            kind: "text",
            weight: 3,
          },
          {
            key: "requiredCredits",
            label: t("column.requiredCredits"),
            kind: "decimal",
            weight: 2,
          },
          {
            key: "averageEarned",
            label: t("column.averageEarned"),
            kind: "decimal",
            weight: 2,
          },
          {
            key: "completion",
            label: t("column.completion"),
            kind: "percent",
            weight: 2,
          },
          {
            key: "members",
            label: t("column.members"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "belowHalf",
            label: t("column.belowHalf"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "behind",
            label: t("column.behind"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "onTrack",
            label: t("column.onTrack"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "atRisk",
            label: t("column.atRisk"),
            kind: "integer",
            weight: 2,
          },
        ],
      };
    }

    if (reportType === AssociationReportType.MISSING_EVIDENCE) {
      const result = await this.reports.missingEvidenceReport(
        user,
        filter,
        page,
      );

      return {
        total: result.totalCount,
        rows: result.items.map((row) => ({
          member: row.fullName,
          email: row.email,
          memberNumber: row.memberNumber,
          group: row.groupTitle,
          requirement: row.requirementName,
          completion: row.percent,
          requiredCredits: row.requiredCredits,
          completedCredits: row.completedCredits,
          awaiting: row.awaitingReviewCount,
          dueDate: row.dueDate,
          daysRemaining: row.daysRemaining,
        })),
        columns: [
          { key: "member", label: t("column.member"), kind: "text", weight: 4 },
          { key: "email", label: t("column.email"), kind: "text", weight: 5 },
          {
            key: "memberNumber",
            label: t("column.memberNumber"),
            kind: "text",
            weight: 3,
          },
          { key: "group", label: t("column.group"), kind: "text", weight: 3 },
          {
            key: "requirement",
            label: t("column.requirement"),
            kind: "text",
            weight: 4,
          },
          {
            key: "completion",
            label: t("column.completion"),
            kind: "percent",
            weight: 2,
          },
          {
            key: "requiredCredits",
            label: t("column.requiredCredits"),
            kind: "decimal",
            weight: 2,
          },
          {
            key: "completedCredits",
            label: t("column.completedCredits"),
            kind: "decimal",
            weight: 2,
          },
          {
            key: "awaiting",
            label: t("column.awaiting"),
            kind: "integer",
            weight: 2,
          },
          {
            key: "dueDate",
            label: t("column.dueDate"),
            kind: "date",
            weight: 3,
          },
          {
            key: "daysRemaining",
            label: t("column.daysRemaining"),
            kind: "integer",
            weight: 2,
          },
        ],
      };
    }

    if (reportType !== AssociationReportType.RENEWAL_READINESS)
      throw new BadRequestException({
        code: AssociationMessageCode.EXPORT_UNSUPPORTED,
        message: "That report cannot be exported.",
      });

    const result = await this.reports.renewalReadinessReport(
      user,
      filter,
      page,
    );

    return {
      total: result.totalCount,
      rows: result.items.map((row) => ({
        member: row.fullName,
        email: row.email,
        memberNumber: row.memberNumber,
        group: row.groupTitle,
        readiness: t(row.isRenewalReady ? "value.ready" : "value.notReady"),
        band: t(`band.${row.band}`),
        completion: row.percent,
        requiredCredits: row.requiredCredits,
        completedCredits: row.completedCredits,
        awaiting: row.awaitingReviewCount,
        deadline: row.earliestUnmetDeadline,
      })),
      columns: [
        { key: "member", label: t("column.member"), kind: "text", weight: 4 },
        { key: "email", label: t("column.email"), kind: "text", weight: 5 },
        {
          key: "memberNumber",
          label: t("column.memberNumber"),
          kind: "text",
          weight: 3,
        },
        { key: "group", label: t("column.group"), kind: "text", weight: 3 },
        {
          key: "readiness",
          label: t("column.readiness"),
          kind: "text",
          weight: 3,
        },
        { key: "band", label: t("column.band"), kind: "text", weight: 3 },
        {
          key: "completion",
          label: t("column.completion"),
          kind: "percent",
          weight: 2,
        },
        {
          key: "requiredCredits",
          label: t("column.requiredCredits"),
          kind: "decimal",
          weight: 2,
        },
        {
          key: "completedCredits",
          label: t("column.completedCredits"),
          kind: "decimal",
          weight: 2,
        },
        {
          key: "awaiting",
          label: t("column.awaiting"),
          kind: "integer",
          weight: 2,
        },
        {
          key: "deadline",
          label: t("column.deadline"),
          kind: "date",
          weight: 3,
        },
      ],
    };
  }

  private async filterLines(
    filter: ReportFilter,
    summary: ReportSummary,
    t: ExportTranslator,
    date: (value: Date | null) => string,
  ): Promise<ExportEntry[]> {
    const group = filter.groupId
      ? await this.prisma.associationGroup.findUnique({
          where: { id: filter.groupId },
          select: { title: true },
        })
      : null;

    const requirement = filter.requirementId
      ? await this.prisma.associationRequirement.findUnique({
          where: { id: filter.requirementId },
          select: { name: true },
        })
      : null;

    return [
      {
        label: t("filter.period"),
        value: `${t(`period.${filter.period ?? "THIS_YEAR"}`)} (${date(summary.periodStart)} - ${date(summary.periodEnd)})`,
      },
      {
        label: t("filter.group"),
        value: group?.title ?? t("filter.allGroups"),
      },
      {
        label: t("filter.requirement"),
        value: requirement?.name ?? t("filter.allRequirements"),
      },
      {
        label: t("filter.includeInactive"),
        value: t(filter.includeInactive ? "value.yes" : "value.no"),
      },
    ];
  }
}
