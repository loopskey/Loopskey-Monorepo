import { PDUCompletionStatus, PDUStatus, Prisma } from "@prisma/client";
import { LEARNING_ACTIVITY_RECORDED_EVENT } from "@professional/public/professional-compliance-api.events";
import { ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { ComplianceActivityDetail } from "@professional/public/professional-compliance-api";
import { ComplianceFileDescriptor } from "@professional/public/professional-compliance-api";
import { type EvidenceStoragePort } from "@professional/storage/evidence-storage.port";
import { ComplianceActivityQuery } from "@professional/public/professional-compliance-api";
import { ComplianceCertificate } from "@professional/public/professional-compliance-api";
import { ComplianceStoredFile } from "@professional/public/professional-compliance-api";
import { SettleReviewCommand } from "@professional/public/professional-compliance-api";
import { ComplianceActivity } from "@professional/public/professional-compliance-api";
import { Inject, Injectable } from "@nestjs/common";
import { EVIDENCE_STORAGE } from "@professional/storage/evidence-storage.port";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";

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

const FILE_SELECT = {
  id: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
} satisfies Prisma.PDUActivityFileSelect;

const ACTIVITY_DETAIL_SELECT = {
  ...ACTIVITY_SELECT,
  source: true,
  evidenceNote: true,
  reviewNote: true,
  evidenceFiles: { select: FILE_SELECT, orderBy: { createdAt: "asc" } },
} satisfies Prisma.PDUActivitySelect;

const CERTIFICATE_SELECT = {
  id: true,
  userId: true,
  title: true,
  issuer: true,
  status: true,
  issuedAt: true,
  validUntil: true,
  pduEarned: true,
  evidenceFiles: { select: FILE_SELECT, orderBy: { createdAt: "asc" } },
} satisfies Prisma.CertificateSelect;

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
    @Inject(EVIDENCE_STORAGE)
    private readonly storage: EvidenceStoragePort,
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

  async activityDetailsForOwners(
    activityIds: string[],
    ownerUserIds: string[],
  ): Promise<ComplianceActivityDetail[]> {
    if (!activityIds.length || !ownerUserIds.length) return [];

    const activities = await this.prisma.pDUActivity.findMany({
      where: { id: { in: activityIds }, userId: { in: ownerUserIds } },
      select: ACTIVITY_DETAIL_SELECT,
      orderBy: { date: "desc" },
    });

    return activities.map((activity) => ({
      ...project(activity),
      source: activity.source,
      evidenceNote: activity.evidenceNote,
      evidenceUrl: activity.evidenceUrl,
      reviewNote: activity.reviewNote,
      files: activity.evidenceFiles,
    }));
  }

  async certificatesForOwners(
    ownerUserIds: string[],
  ): Promise<ComplianceCertificate[]> {
    if (!ownerUserIds.length) return [];

    const certificates = await this.prisma.certificate.findMany({
      where: { userId: { in: ownerUserIds } },
      select: CERTIFICATE_SELECT,
      orderBy: { issuedAt: "desc" },
    });

    return certificates.map((certificate) => ({
      id: certificate.id,
      userId: certificate.userId,
      title: certificate.title,
      issuer: certificate.issuer,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
      validUntil: certificate.validUntil,
      creditsEarned: certificate.pduEarned,
      files: certificate.evidenceFiles,
    }));
  }

  async evidenceFileForOwners(
    fileId: string,
    ownerUserIds: string[],
  ): Promise<ComplianceStoredFile | null> {
    if (!ownerUserIds.length) return null;

    const file = await this.prisma.pDUActivityFile.findFirst({
      where: { id: fileId, userId: { in: ownerUserIds } },
      select: { ...FILE_SELECT, storageKey: true, activityId: true },
    });

    if (!file) return null;

    const { activityId, ...rest } = file;
    return this.stored(rest, activityId, "pdu");
  }

  async certificateFileForOwners(
    fileId: string,
    ownerUserIds: string[],
  ): Promise<ComplianceStoredFile | null> {
    if (!ownerUserIds.length) return null;

    const file = await this.prisma.certificateFile.findFirst({
      where: { id: fileId, userId: { in: ownerUserIds } },
      select: { ...FILE_SELECT, storageKey: true, certificateId: true },
    });

    if (!file) return null;

    const { certificateId, ...rest } = file;
    return this.stored(rest, certificateId, "certificate");
  }

  private stored(
    file: ComplianceFileDescriptor & { storageKey: string },
    sourceId: string,
    namespace: "pdu" | "certificate",
  ): ComplianceStoredFile | null {
    const { storageKey, ...descriptor } = file;

    try {
      return {
        sourceId,
        file: descriptor,
        filePath: this.storage.resolve(namespace, storageKey),
      };
    } catch {
      return null;
    }
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
