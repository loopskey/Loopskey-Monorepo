import { AssociationSettingsService } from "@association/services/association-settings.service";
import { SETTINGS_RECOMPUTE_EVENT } from "@association/services/association-settings.service";
import { AssociationSettingsRecomputeHandler } from "@association/application/association-settings-recompute.handler";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import {
  CreditType,
  PDUCategory,
  PDUSource,
  PDUStatus,
  Role,
} from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-settings");

const REQUIRED_CREDITS = 20;

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("Association settings (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let settings: AssociationSettingsService;
  let compliance: AssociationComplianceService;
  let handler: AssociationSettingsRecomputeHandler;

  let ownerId: string;
  let associationId: string;
  let requirementId: string;

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });

  const addMember = async (label: string, credits: number) => {
    const user = await prisma.user.create({
      data: {
        email: scope.email(label),
        fullName: `Settings ${label}`,
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    if (credits > 0)
      await prisma.pDUActivity.create({
        data: {
          userId: user.id,
          title: scope.eventTitle(`activity ${label}`),
          category: PDUCategory.TECHNICAL,
          source: PDUSource.OTHER,
          status: PDUStatus.APPROVED,
          pdus: credits,
          date: day("2026-06-15"),
          creditType: CreditType.CPD,
          evidenceUrl: "https://evidence.example.test/one",
        },
      });

    const member = await prisma.associationMember.create({
      data: {
        associationId,
        userId: user.id,
        status: AssociationMemberStatus.ACTIVE,
        memberNumber: `S-${label}`,
        invitedAt: new Date(),
      },
    });

    await prisma.associationRequirementAssignment.create({
      data: {
        requirementId,
        memberId: member.id,
        cycleStart: day("2026-01-01"),
        cycleEnd: day("2026-12-31"),
        dueDate: day("2026-12-31"),
      },
    });

    return member.id;
  };

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    settings = app.get(AssociationSettingsService);
    compliance = app.get(AssociationComplianceService);
    handler = app.get(AssociationSettingsRecomputeHandler);

    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email("owner"),
        fullName: "Settings Owner",
        role: Role.ASSOCIATION,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    ownerId = ownerUser.id;

    const association = await prisma.association.create({
      data: {
        name: scope.eventTitle("institute"),
        ownerId,
        settings: { create: { onTrackThreshold: 70, atRiskThreshold: 40 } },
      },
    });

    associationId = association.id;

    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId,
        createdById: ownerId,
        name: scope.eventTitle("annual"),
        creditType: CreditType.CPD,
        totalRequiredCredits: REQUIRED_CREDITS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
        evidencePolicy: AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        deadline: day("2026-12-31"),
      },
    });

    requirementId = requirement.id;

    await addMember("half", REQUIRED_CREDITS / 2);
    await addMember("most", REQUIRED_CREDITS * 0.9);

    await compliance.recomputeAssociation(associationId);
  }, 120000);

  afterAll(async () => {
    await prisma.outboxEvent.deleteMany({
      where: {
        eventName: SETTINGS_RECOMPUTE_EVENT,
        aggregateId: associationId,
      },
    });
    await scope.cleanup(prisma);
    await app.close();
  }, 60000);

  const current = () =>
    prisma.associationSettings.findUniqueOrThrow({
      where: { associationId },
      select: {
        updatedAt: true,
        onTrackThreshold: true,
        atRiskThreshold: true,
      },
    });

  const command = (updatedAt: Date, onTrack: number, atRisk: number) => ({
    defaultCreditType: CreditType.CPD,
    onTrackThreshold: onTrack,
    atRiskThreshold: atRisk,
    renewalRequiresReviewedEvidence: true,
    expectedUpdatedAt: updatedAt,
  });

  const codeOf = (error: unknown) => {
    const response = (
      error as { getResponse?: () => { code?: string } }
    ).getResponse?.();
    return response?.code ?? null;
  };

  it("lets exactly one of two simultaneous saves commit", async () => {
    const before = await current();

    const outcomes = await runTogether(2, () =>
      settings.updateCompliance(owner(), command(before.updatedAt, 55, 25)),
    );

    const applied = outcomes.filter(
      (outcome) => outcome.status === "fulfilled",
    );
    const refused = outcomes.filter((outcome) => outcome.status === "rejected");

    expect(applied).toHaveLength(1);
    expect(refused).toHaveLength(1);
    expect(codeOf((refused[0] as PromiseRejectedResult).reason)).toBe(
      AssociationMessageCode.SETTINGS_STALE,
    );

    const after = await current();
    expect(after.onTrackThreshold).toBe(55);
    expect(after.atRiskThreshold).toBe(25);
  }, 60000);

  it("refuses a save that names a timestamp already spent", async () => {
    const stale = await current();
    await settings.updateCompliance(owner(), command(stale.updatedAt, 60, 30));

    await expect(
      settings.updateCompliance(owner(), command(stale.updatedAt, 65, 35)),
    ).rejects.toMatchObject({});

    const after = await current();
    expect(after.onTrackThreshold).toBe(60);
  }, 60000);

  it("moves bands without moving a single credit", async () => {
    const assignmentsBefore =
      await prisma.associationRequirementAssignment.findMany({
        where: { requirement: { associationId } },
        select: { id: true, band: true, completedCredits: true, percent: true },
        orderBy: { id: "asc" },
      });

    const creditsBefore = assignmentsBefore.map((one) => one.completedCredits);

    const before = await current();
    const outcome = await settings.updateCompliance(
      owner(),
      command(before.updatedAt, 40, 20),
    );

    expect(outcome.applied).toBe(true);
    expect(outcome.impact.membersChangingBand).toBeGreaterThan(0);

    await handler.handle({ associationId });

    const assignmentsAfter =
      await prisma.associationRequirementAssignment.findMany({
        where: { requirement: { associationId } },
        select: { id: true, band: true, completedCredits: true, percent: true },
        orderBy: { id: "asc" },
      });

    expect(assignmentsAfter.map((one) => one.completedCredits)).toEqual(
      creditsBefore,
    );
    expect(assignmentsAfter.map((one) => one.percent)).toEqual(
      assignmentsBefore.map((one) => one.percent),
    );
    expect(
      assignmentsAfter.every(
        (one) => one.band === AssociationComplianceBand.ON_TRACK,
      ),
    ).toBe(true);
  }, 120000);

  it("queues the reclassification in the same transaction as the write", async () => {
    await prisma.outboxEvent.deleteMany({
      where: {
        eventName: SETTINGS_RECOMPUTE_EVENT,
        aggregateId: associationId,
      },
    });

    const before = await current();
    await settings.updateCompliance(owner(), command(before.updatedAt, 75, 45));

    expect(
      await prisma.outboxEvent.count({
        where: {
          eventName: SETTINGS_RECOMPUTE_EVENT,
          aggregateId: associationId,
        },
      }),
    ).toBe(1);

    const unchanged = await current();
    await settings.updateCompliance(
      owner(),
      command(unchanged.updatedAt, 75, 40),
    );

    expect(
      await prisma.outboxEvent.count({
        where: {
          eventName: SETTINGS_RECOMPUTE_EVENT,
          aggregateId: associationId,
        },
      }),
    ).toBe(1);
  }, 60000);

  it("writes nothing when a refused threshold pair loses a race", async () => {
    const before = await current();

    const outcomes = await runTogether(2, () =>
      settings.updateCompliance(owner(), command(before.updatedAt, 40, 60)),
    );

    expect(outcomes.every((outcome) => outcome.status === "rejected")).toBe(
      true,
    );

    const after = await current();
    expect(after.updatedAt.getTime()).toBe(before.updatedAt.getTime());
  }, 60000);
});
