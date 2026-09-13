import { AssociationGeneratedReportState } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { ServiceUnavailableException } from "@nestjs/common";
import { type CategoryAttentionGroup } from "@association/types/association-attention.types";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { AssociationMessageType } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type TAssociationUser } from "@association/types/association-service.types";
import { type ReportMemberRow } from "@association/types/association-report.types";
import { type AttentionCounts } from "@association/types/association-attention.types";
import { type AttentionRow } from "@association/types/association-attention.types";
import { calendarDaysUntil } from "@association/utils/compliance-attribution.util";
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

    const [needingAttention, newJoiners, categoryBehind, expiring] =
      await Promise.all([
        this.membersNeedingAttention(user, associationId),
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

    const counts: AttentionCounts = {
      readyReports,
      newJoiners: newJoiners.length,
      belowThreshold: needingAttention.length,
      categoryBehind: categoryBehind.length,
      expiringCertificates: expiring.length,
    };

    this.logger.log("Association attention lists read", {
      associationId: association.id,
      ...counts,
    });

    return { counts };
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
      return this.membersNeedingAttention(user, associationId);

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

  async categoryAttentionGroups(
    user: TAssociationUser,
    page?: { take?: number | null; cursor?: string | null },
    associationId?: string,
  ) {
    const groups = await this.categoryGroupsFor(user, associationId);
    const take = Math.min(
      page?.take ?? A.ATTENTION_PAGE_DEFAULT,
      A.ATTENTION_PAGE_MAX,
    );

    const cursorKey = (group: CategoryAttentionGroup) =>
      `${group.requirementId}:${group.categoryId}`;

    const cursorIndex = page?.cursor
      ? groups.findIndex((group) => cursorKey(group) === page.cursor)
      : -1;
    const start = cursorIndex < 0 ? 0 : cursorIndex + 1;
    const items = groups.slice(start, start + take);
    const hasNextPage = start + take < groups.length;

    return {
      items,
      totalCount: groups.length,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? cursorKey(items.at(-1)!) : null,
      },
    };
  }

  async atRiskThreshold(associationId: string) {
    const settings = await this.prisma.associationSettings.findUnique({
      where: { associationId },
      select: { atRiskThreshold: true },
    });

    return settings?.atRiskThreshold ?? DEFAULT_AT_RISK_THRESHOLD;
  }

  private async membersNeedingAttention(
    user: TAssociationUser,
    associationId?: string,
  ): Promise<AttentionRow[]> {
    await this.access.requireReadable(user, associationId);
    const now = new Date();

    const report = await this.reports.memberProgressReport(
      user,
      ATTENTION_FILTER,
      { take: A.ATTENTION_PAGE_MAX },
      associationId,
    );

    return report.items.flatMap((member) => {
      const due = member.assignments
        .filter(
          (assignment) =>
            assignment.dueDate &&
            assignment.percent < 100 &&
            calendarDaysUntil(now, assignment.dueDate) >= 0 &&
            calendarDaysUntil(now, assignment.dueDate) <=
              A.MEMBER_ATTENTION_WINDOW_DAYS,
        )
        .sort(
          (left, right) => left.dueDate!.getTime() - right.dueDate!.getTime(),
        );

      if (!due.length) return [];

      const earliest = due[0];

      return [
        {
          ...this.rowOf(member),
          deadline: earliest.dueDate,
          percent: earliest.percent,
          band: earliest.band,
          requiredCredits: earliest.requiredCredits,
          completedCredits: earliest.completedCredits,
          detail: earliest.requirementName,
        },
      ];
    });
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

  private async categoryGroupsFor(
    user: TAssociationUser,
    associationId?: string,
  ): Promise<CategoryAttentionGroup[]> {
    const association = await this.access.requireReadable(user, associationId);
    const threshold = await this.atRiskThreshold(association.id);

    const report = await this.reports.memberProgressReport(
      user,
      ATTENTION_FILTER,
      { take: A.ATTENTION_PAGE_MAX },
      associationId,
    );

    const groups = new Map<string, CategoryAttentionGroup>();

    for (const member of report.items) {
      for (const assignment of member.assignments) {
        for (const category of assignment.categories) {
          if (category.requiredCredits <= 0) continue;
          if (category.percent >= threshold) continue;

          const key = `${assignment.requirementId}:${category.categoryId}`;
          const group = groups.get(key) ?? {
            requirementId: assignment.requirementId,
            requirementName: assignment.requirementName,
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            deadline: null,
            affectedCount: 0,
            members: [],
          };

          group.deadline =
            assignment.dueDate &&
            (!group.deadline || assignment.dueDate < group.deadline)
              ? assignment.dueDate
              : group.deadline;
          group.affectedCount += 1;

          if (group.members.length < A.CATEGORY_GROUP_MEMBERS_MAX)
            group.members.push({
              ...this.rowOf(member),
              percent: category.percent,
              band: null,
              deadline: assignment.dueDate,
              requiredCredits: category.requiredCredits,
              completedCredits: category.completedCredits,
              detail: category.categoryName,
              detailDate: null,
            });

          groups.set(key, group);
        }
      }
    }

    return [...groups.values()].sort((left, right) => {
      if (left.deadline && right.deadline)
        return left.deadline.getTime() - right.deadline.getTime();
      if (left.deadline) return -1;
      if (right.deadline) return 1;
      return left.requirementName.localeCompare(right.requirementName);
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

  private async certificatesFor(userIds: string[]) {
    try {
      return await this.professional.certificatesForOwners(userIds);
    } catch (error) {
      this.logger.error("Certification source data unavailable", {
        message: error instanceof Error ? error.message : "Unknown error",
      });

      throw new ServiceUnavailableException({
        code: AssociationMessageCode.SOURCE_DATA_UNAVAILABLE,
        message: "Certification data is temporarily unavailable.",
      });
    }
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

    const certificates = await this.certificatesFor(
      members.map((member) => member.userId),
    );

    const soonest = new Map<string, { title: string; validUntil: Date }>();

    for (const certificate of certificates) {
      if (!certificate.validUntil) continue;
      if (
        calendarDaysUntil(now, certificate.validUntil) >
        A.CERTIFICATE_EXPIRY_WINDOW_DAYS
      )
        continue;

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
