import { AssociationReportGenerationService } from "@association/services/association-report-generation.service";
import { AssociationReportRetentionService } from "@association/services/association-report-retention.service";
import { AssociationReportExportService } from "@association/services/association-report-export.service";
import { REPORT_EXPORT_EVENT } from "@association/services/association-report-export.service";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationGeneratedReportState } from "@prisma/client";
import { AssociationReportFormat, AssociationReportType } from "@prisma/client";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, PDUCategory, PDUSource, Role } from "@prisma/client";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, fulfilled, runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-report-export");

const REQUIRED_CREDITS = 10;

const MEMBER_COUNT = 3;

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const request = {
  reportType: AssociationReportType.MEMBER_PROGRESS,
  format: AssociationReportFormat.EXCEL,
  filter: { period: AssociationReportPeriod.THIS_YEAR },
};

describe("Association report exports (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let storage: ObjectStoragePort;
  let exports: AssociationReportExportService;
  let generation: AssociationReportGenerationService;
  let retention: AssociationReportRetentionService;

  let ownerId: string;
  let otherOwnerId: string;
  let associationId: string;

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });
  const otherOwner = () => ({ id: otherOwnerId, role: Role.ASSOCIATION });

  const refusal = async (act: Promise<unknown>) => {
    try {
      await act;
      return null;
    } catch (error) {
      return {
        status: (error as { getStatus: () => number }).getStatus(),
        code: (error as { getResponse: () => { code: string } }).getResponse()
          .code,
      };
    }
  };

  const buildAssociation = async (label: string, userId: string) =>
    prisma.association.create({
      data: {
        name: scope.eventTitle(label),
        ownerId: userId,
        settings: { create: { onTrackThreshold: 70, atRiskThreshold: 40 } },
      },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    exports = app.get(AssociationReportExportService);
    generation = app.get(AssociationReportGenerationService);
    retention = app.get(AssociationReportRetentionService);
    storage = app.get<ObjectStoragePort>(OBJECT_STORAGE);
    await scope.cleanup(prisma);

    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email("export-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    ownerId = ownerUser.id;

    const otherOwnerUser = await prisma.user.create({
      data: {
        email: scope.email("export-other-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    otherOwnerId = otherOwnerUser.id;

    const association = await buildAssociation("export-association", ownerId);
    associationId = association.id;

    await buildAssociation("export-other-association", otherOwnerId);

    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId,
        createdById: ownerId,
        name: scope.eventTitle("export-requirement"),
        creditType: CreditType.CPD,
        totalRequiredCredits: REQUIRED_CREDITS,
        deadline: day("2026-12-31"),
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    const compliance = app.get(AssociationComplianceService);

    for (let index = 0; index < MEMBER_COUNT; index += 1) {
      const memberUser = await prisma.user.create({
        data: {
          email: scope.email(`export-member-${index}`),
          role: Role.PROFESSIONAL,
          status: "ACTIVE",
          fullName: `Export Member ${index}`,
        },
      });

      const member = await prisma.associationMember.create({
        data: {
          associationId,
          userId: memberUser.id,
          memberNumber: `EX-${index}`,
          status: AssociationMemberStatus.ACTIVE,
        },
      });

      const assignment = await prisma.associationRequirementAssignment.create({
        data: {
          memberId: member.id,
          requirementId: requirement.id,
          cycleStart: day("2026-01-01"),
          dueDate: day("2026-12-31"),
        },
      });

      await prisma.pDUActivity.create({
        data: {
          userId: memberUser.id,
          title: scope.eventTitle(`export-activity-${index}`),
          date: day("2026-06-01"),
          pdus: REQUIRED_CREDITS - index * 3,
          source: PDUSource.OTHER,
          category: PDUCategory.TECHNICAL,
          creditType: CreditType.CPD,
        },
      });

      await compliance.recomputeAssignment(assignment.id);
    }
  });

  afterAll(async () => {
    const written = await prisma.associationGeneratedReport.findMany({
      where: { associationId },
      select: { storageKey: true },
    });

    for (const record of written)
      await storage.remove("report", record.storageKey);

    await scope.cleanup(prisma);
    await app.close();
  });

  it("returns a pending record without generating on the request thread", async () => {
    const record = await exports.request(owner(), request);

    expect(record.state).toBe(AssociationGeneratedReportState.PENDING);
    expect(record.rowCount).toBeNull();
    expect(record.sizeBytes).toBeNull();

    const events = await prisma.outboxEvent.count({
      where: { eventName: REPORT_EXPORT_EVENT, aggregateId: record.id },
    });

    expect(events).toBe(1);

    await prisma.associationGeneratedReport.deleteMany({
      where: { id: record.id },
    });
  });

  it("generates once when the same export is requested simultaneously", async () => {
    const results = await runTogether(4, () => exports.request(owner(), request));
    const answered = fulfilled(results).map((result) => result.value);

    expect(answered).toHaveLength(4);
    expect(new Set(answered.map((record) => record.id)).size).toBe(1);

    const pending = await prisma.associationGeneratedReport.count({
      where: {
        associationId,
        state: AssociationGeneratedReportState.PENDING,
        reportType: request.reportType,
        format: request.format,
      },
    });

    expect(pending).toBe(1);
  });

  it("ends ready with one file, and a redelivery changes nothing", async () => {
    const pending = await prisma.associationGeneratedReport.findFirstOrThrow({
      where: {
        associationId,
        state: AssociationGeneratedReportState.PENDING,
      },
    });

    await generation.run(pending.id);
    await generation.run(pending.id);

    const settled = await prisma.associationGeneratedReport.findUniqueOrThrow({
      where: { id: pending.id },
    });

    expect(settled.state).toBe(AssociationGeneratedReportState.READY);
    expect(settled.rowCount).toBe(MEMBER_COUNT);
    expect(settled.sizeBytes).toBeGreaterThan(0);
    expect(settled.expiresAt).not.toBeNull();
    expect(await storage.exists("report", settled.storageKey)).toBe(true);
  });

  it("lets the owning association download it and nobody else", async () => {
    const ready = await prisma.associationGeneratedReport.findFirstOrThrow({
      where: { associationId, state: AssociationGeneratedReportState.READY },
    });

    const file = await exports.downloadable(owner(), ready.id);

    expect(file.fileName).toBe(ready.fileName);
    expect(file.sizeBytes).toBe(ready.sizeBytes);

    const onForeign = await refusal(
      exports.downloadable(otherOwner(), ready.id),
    );
    const onMissing = await refusal(
      exports.downloadable(otherOwner(), "does-not-exist"),
    );

    expect(onForeign).toEqual(onMissing);
    expect(onForeign?.status).toBe(404);
  });

  it("expires the file before the record, and refuses the download after", async () => {
    const ready = await prisma.associationGeneratedReport.findFirstOrThrow({
      where: { associationId, state: AssociationGeneratedReportState.READY },
    });

    await prisma.associationGeneratedReport.update({
      where: { id: ready.id },
      data: { expiresAt: day("2020-01-01") },
    });

    await retention.sweep();

    const expired = await prisma.associationGeneratedReport.findUniqueOrThrow({
      where: { id: ready.id },
    });

    expect(expired.state).toBe(AssociationGeneratedReportState.EXPIRED);
    expect(await storage.exists("report", expired.storageKey)).toBe(false);

    const refused = await refusal(exports.downloadable(owner(), ready.id));

    expect(refused?.status).toBe(410);
  });
});
