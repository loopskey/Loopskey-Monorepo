import { PDUCompletionStatus, PDUStatus, Prisma } from "@prisma/client";
import { LEARNING_ACTIVITY_RECORDED_EVENT } from "@professional/public/professional-compliance-api.events";
import { ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { ComplianceActivityQuery } from "@professional/public/professional-compliance-api";
import { SettleReviewCommand } from "@professional/public/professional-compliance-api";
import { ComplianceActivity } from "@professional/public/professional-compliance-api";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const ACTIVITY_SELECT = {
  id: true,
  userId: true,
  title: true,
  category: true,
  creditType: true,
  pdus: true,
  date: true,
  status: true,
  evidenceUrl: true,
  _count: { select: { evidenceFiles: true } },
} satisfies Prisma.PDUActivitySelect;

type ActivityRow = Prisma.PDUActivityGetPayload<{
  select: typeof ACTIVITY_SELECT;
}>;

const project = (activity: ActivityRow): ComplianceActivity => ({
  id: activity.id,
  userId: activity.userId,
  title: activity.title,
  category: activity.category,
  creditType: activity.creditType,
  credits: activity.pdus,
  date: activity.date,
  status: activity.status,
  hasEvidence:
    Boolean(activity.evidenceUrl?.trim()) || activity._count.evidenceFiles > 0,
});

@Injectable()
export class ProfessionalComplianceApiService
  implements ProfessionalComplianceApi
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async activitiesForMembers(
    query: ComplianceActivityQuery,
  ): Promise<ComplianceActivity[]> {
    if (!query.userIds.length) return [];

    const activities = await this.prisma.pDUActivity.findMany({
      where: {
        userId: { in: query.userIds },
        completionStatus: PDUCompletionStatus.COMPLETED,
        ...(query.from || query.to
          ? {
              date: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {}),
              },
            }
          : {}),
      },
      select: ACTIVITY_SELECT,
      orderBy: { date: "asc" },
    });

    return activities.map(project);
  }

  async activityForOwners(
    activityId: string,
    ownerUserIds: string[],
  ): Promise<ComplianceActivity | null> {
    if (!ownerUserIds.length) return null;

    const activity = await this.prisma.pDUActivity.findFirst({
      where: { id: activityId, userId: { in: ownerUserIds } },
      select: ACTIVITY_SELECT,
    });

    return activity ? project(activity) : null;
  }

  async settleReview(command: SettleReviewCommand): Promise<boolean> {
    if (!command.ownerUserIds.length) return false;

    const settled = await this.prisma.pDUActivity.updateMany({
      where: {
        id: command.activityId,
        userId: { in: command.ownerUserIds },
        status: PDUStatus.PENDING,
      },
      data: {
        status: command.approve ? PDUStatus.APPROVED : PDUStatus.REJECTED,
        reviewNote: command.reviewNote?.trim() || null,
      },
    });

    if (settled.count !== 1) return false;

    const activity = await this.prisma.pDUActivity.findUnique({
      where: { id: command.activityId },
      select: { userId: true },
    });

    if (activity)
      await this.outbox.append({
        eventName: LEARNING_ACTIVITY_RECORDED_EVENT,
        aggregateType: "PDUActivity",
        aggregateId: command.activityId,
        payload: { activityId: command.activityId, userId: activity.userId },
      });

    return true;
  }
}
