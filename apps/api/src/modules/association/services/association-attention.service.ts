import {
  AssociationGeneratedReportState,
  AssociationMemberStatus,
} from "@prisma/client";
import {
  AssociationComplianceBand,
  AssociationMessageType,
} from "@prisma/client";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { type TAssociationUser } from "@association/types/association-service.types";
import { type ReportMemberRow } from "@association/types/association-report.types";
import { type AttentionCounts } from "@association/types/association-attention.types";
import { type AttentionRow } from "@association/types/association-attention.types";
import { PrismaService } from "@prisma/prisma.service";

import * as A from "@association/types/association-attention.types";

const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_AT_RISK_THRESHOLD = 40;

const ATTENTION_FILTER = { period: AssociationReportPeriod.THIS_YEAR };

@Injectable()
export class AssociationAttentionService {
  private readonly logger = new Logger(AssociationAttentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly reports: AssociationReportService,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly professional: ProfessionalComplianceApi,
  ) {}

  async lists(user: TAssociationUser, associationId?: string) {
    const association = await this.access.requireReadable(user, associationId);
    const now = new Date();

    const [belowThreshold, newJoiners, categoryBehind, expiring] =
      await Promise.all([
        this.belowThreshold(user, associationId),
        this.newJoiners(association.id, now),
        this.categoryBehind(user, associationId),
        this.expiringCertificates(association.id, now),
      ]);

    const readyReports = await this.prisma.associationGeneratedReport.count({
      where: {
        associationId: association.id,
        state: AssociationGeneratedReportState.READY,
      },
    });

    const distribution = await this.reports.memberDistribution(
      user,
      ATTENTION_FILTER,
      associationId,
    );

    const counts: AttentionCounts = {
      readyReports,
      newJoiners: newJoiners.length,
      belowThreshold: belowThreshold.length,
      categoryBehind: categoryBehind.length,
      expiringCertificates: expiring.length,
    };

    this.logger.log("Association attention lists read", {
      associationId: association.id,
      ...counts,
    });

    return { counts, distribution };
  }

  async section(
    user: TAssociationUser,
    section: AssociationAttentionSection,
    page?: { take?: number | null; cursor?: string | null },
    associationId?: string,
  ) {
    const rows = await this.rowsFor(user, section, associationId);
    const take = Math.min(
      page?.take ?? A.ATTENTION_PAGE_DEFAULT,
      A.ATTENTION_PAGE_MAX,
    );

    const cursorIndex = page?.cursor
      ? rows.findIndex((row) => row.memberId === page.cursor)
      : -1;
    const start = cursorIndex < 0 ? 0 : cursorIndex + 1;
    const items = rows.slice(start, start + take);
    const hasNextPage = start + take < rows.length;

    return {
      items,
      totalCount: rows.length,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.memberId ?? null) : null,
      },
    };
  }

  async rowsFor(
    user: TAssociationUser,
    section: AssociationAttentionSection,
    associationId?: string,
  ): Promise<AttentionRow[]> {
    if (section === AssociationAttentionSection.BELOW_THRESHOLD)
      return this.belowThreshold(user, associationId);

    if (section === AssociationAttentionSection.CATEGORY_BEHIND)
      return this.categoryBehind(user, associationId);

    const association = await this.access.requireReadable(user, associationId);
    const now = new Date();

    if (section === AssociationAttentionSection.NEW_JOINERS)
      return this.newJoiners(association.id, now);

    if (section === AssociationAttentionSection.EXPIRING_CERTIFICATES)
      return this.expiringCertificates(association.id, now);

    return [];
  }

  async atRiskThreshold(associationId: string) {
    const settings = await this.prisma.associationSettings.findUnique({
      where: { associationId },
      select: { atRiskThreshold: true },
    });

    return settings?.atRiskThreshold ?? DEFAULT_AT_RISK_THRESHOLD;
  }

  private async belowThreshold(
    user: TAssociationUser,
    associationId?: string,
  ): Promise<AttentionRow[]> {
    const association = await this.access.requireReadable(user, associationId);
    const threshold = await this.atRiskThreshold(association.id);

    const report = await this.reports.memberProgressReport(
      user,
      ATTENTION_FILTER,
      { take: A.ATTENTION_PAGE_MAX },
      associationId,
    );

    return report.items
      .filter((member) =>
        member.assignments.some((assignment) => assignment.percent < threshold),
      )
      .map((member) => this.rowOf(member));
  }

  private async categoryBehind(
    user: TAssociationUser,
    associationId?: string,
  ): Promise<AttentionRow[]> {
    const association = await this.access.requireReadable(user, associationId);
    const threshold = await this.atRiskThreshold(association.id);

    const report = await this.reports.memberProgressReport(
      user,
      ATTENTION_FILTER,
      { take: A.ATTENTION_PAGE_MAX },
      associationId,
    );

    return report.items.flatMap((member) => {
      const weakest = member.assignments
        .flatMap((assignment) => assignment.categories)
        .filter(
          (category) =>
            category.requiredCredits > 0 && category.percent < threshold,
        )
        .sort((left, right) => left.percent - right.percent)
        .at(0);

      if (!weakest) return [];

      return [
        {
          ...this.rowOf(member),
          percent: weakest.percent,
          detail: weakest.categoryName,
          requiredCredits: weakest.requiredCredits,
          completedCredits: weakest.completedCredits,
        },
      ];
    });
  }

  private async newJoiners(
    associationId: string,
    now: Date,
  ): Promise<AttentionRow[]> {
    const since = new Date(now.getTime() - A.NEW_JOINER_WINDOW_DAYS * DAY_MS);

    const members = await this.prisma.associationMember.findMany({
      where: {
        associationId,
        status: AssociationMemberStatus.ACTIVE,
        activatedAt: { gte: since },
        messageDeliveries: {
          none: { messageType: AssociationMessageType.WELCOME },
        },
      },
      select: {
        id: true,
        userId: true,
        groupId: true,
        activatedAt: true,
        memberNumber: true,
        group: { select: { title: true } },
        user: { select: { email: true, fullName: true } },
      },
      orderBy: { activatedAt: "desc" },
    });

    return members.map((member) => ({
      memberId: member.id,
      userId: member.userId,
      email: member.user.email,
      fullName: member.user.fullName,
      memberNumber: member.memberNumber,
      groupId: member.groupId,
      groupTitle: member.group?.title ?? null,
      percent: null,
      band: null,
      requiredCredits: null,
      completedCredits: null,
      deadline: null,
      detail: null,
      detailDate: member.activatedAt,
    }));
  }

  private async expiringCertificates(
    associationId: string,
    now: Date,
  ): Promise<AttentionRow[]> {
    const members = await this.prisma.associationMember.findMany({
      where: {
        associationId,
        status: { not: AssociationMemberStatus.INACTIVE },
      },
      select: {
        id: true,
        userId: true,
        groupId: true,
        memberNumber: true,
        group: { select: { title: true } },
        user: { select: { email: true, fullName: true } },
      },
    });

    if (!members.length) return [];

    const certificates = await this.professional.certificatesForOwners(
      members.map((member) => member.userId),
    );

    const horizon = new Date(
      now.getTime() + A.CERTIFICATE_EXPIRY_WINDOW_DAYS * DAY_MS,
    );

    const soonest = new Map<string, { title: string; validUntil: Date }>();

    for (const certificate of certificates) {
      if (!certificate.validUntil) continue;
      if (certificate.validUntil > horizon) continue;

      const held = soonest.get(certificate.userId);
      if (held && held.validUntil <= certificate.validUntil) continue;

      soonest.set(certificate.userId, {
        title: certificate.title,
        validUntil: certificate.validUntil,
      });
    }

    return members
      .filter((member) => soonest.has(member.userId))
      .map((member) => {
        const certificate = soonest.get(member.userId)!;

        return {
          memberId: member.id,
          userId: member.userId,
          email: member.user.email,
          fullName: member.user.fullName,
          memberNumber: member.memberNumber,
          groupId: member.groupId,
          groupTitle: member.group?.title ?? null,
          percent: null,
          band: null,
          requiredCredits: null,
          completedCredits: null,
          deadline: null,
          detail: certificate.title,
          detailDate: certificate.validUntil,
        };
      })
      .sort(
        (left, right) =>
          (left.detailDate?.getTime() ?? 0) -
          (right.detailDate?.getTime() ?? 0),
      );
  }

  private rowOf(member: ReportMemberRow): AttentionRow {
    return {
      memberId: member.memberId,
      userId: member.userId,
      email: member.email,
      fullName: member.fullName,
      memberNumber: member.memberNumber,
      groupId: member.groupId,
      groupTitle: member.groupTitle,
      percent: member.percent,
      band: member.band ?? AssociationComplianceBand.NOT_STARTED,
      requiredCredits: member.requiredCredits,
      completedCredits: member.completedCredits,
      deadline: member.earliestUnmetDeadline,
      detail: null,
      detailDate: null,
    };
  }
}
