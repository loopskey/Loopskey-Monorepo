import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationReviewService } from "@association/services/association-review.service";
import { AssociationEvidencePolicy, AuditAction } from "@prisma/client";
import { AssociationAttributionState, PDUStatus } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, PDUCategory, PDUSource, Role } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, rejected, runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-review");

const REQUIRED_CREDITS = 10;

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/**
 * Approving a member's evidence, end to end.
 *
 * The decision is a conditional write on the activity's PENDING status, so the
 * assertion that matters is the row count an auditor would later count: two
 * simultaneous approvals must leave one audit entry, and the loser must be told
 * the decision was already made rather than silently overwriting it.
 */
describe("Association evidence review (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let reviews: AssociationReviewService;
  let compliance: AssociationComplianceService;

  let ownerId: string;
  let memberUserId: string;
  let memberId: string;
  let requirementId: string;
  let assignmentId: string;

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });

  const recordActivity = async (status: PDUStatus = PDUStatus.PENDING) =>
    prisma.pDUActivity.create({
      data: {
        userId: memberUserId,
        title: scope.eventTitle("evidence"),
        date: day("2026-06-01"),
        pdus: REQUIRED_CREDITS,
        source: PDUSource.OTHER,
        category: PDUCategory.TECHNICAL,
        creditType: CreditType.CPD,
        status,
        evidenceUrl: "https://example.test/certificate.pdf",
      },
    });

  const assignment = () =>
    prisma.associationRequirementAssignment.findUniqueOrThrow({
      where: { id: assignmentId },
    });

  const auditCount = (activityId: string) =>
    prisma.auditLog.count({
      where: {
        entityId: activityId,
        action: {
          in: [
            AuditAction.ASSOCIATION_ACTIVITY_APPROVED,
            AuditAction.ASSOCIATION_ACTIVITY_REJECTED,
          ],
        },
      },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    reviews = app.get(AssociationReviewService);
    compliance = app.get(AssociationComplianceService);
    await scope.cleanup(prisma);

    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email("association-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    ownerId = ownerUser.id;

    const memberUser = await prisma.user.create({
      data: {
        email: scope.email("association-member"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
        fullName: "A Member",
      },
    });
    memberUserId = memberUser.id;

    const association = await prisma.association.create({
      data: {
        name: scope.eventTitle("association"),
        ownerId,
        settings: { create: { onTrackThreshold: 70, atRiskThreshold: 40 } },
      },
    });

    const member = await prisma.associationMember.create({
      data: {
        associationId: association.id,
        userId: memberUserId,
        status: AssociationMemberStatus.ACTIVE,
      },
    });
    memberId = member.id;

    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId: association.id,
        createdById: ownerId,
        name: scope.eventTitle("requirement"),
        creditType: CreditType.CPD,
        totalRequiredCredits: REQUIRED_CREDITS,
        deadline: day("2026-12-31"),
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    requirementId = requirement.id;

    const created = await prisma.associationRequirementAssignment.create({
      data: {
        requirementId,
        memberId,
        cycleStart: day("2026-01-01"),
        dueDate: day("2026-12-31"),
      },
    });
    assignmentId = created.id;
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany({ where: { actorId: ownerId } });
    await prisma.pDUActivity.deleteMany({ where: { userId: memberUserId } });
    await prisma.associationCreditAttribution.deleteMany({
      where: { assignmentId },
    });
    await prisma.associationRequirementAssignment.update({
      where: { id: assignmentId },
      data: {
        completedCredits: 0,
        recordedCredits: 0,
        percent: 0,
        band: AssociationComplianceBand.NOT_STARTED,
        awaitingReviewCount: 0,
        isMissingEvidence: false,
        computedAt: null,
      },
    });
  });

  afterAll(async () => {
    await scope.cleanup(prisma);
    await app.close();
  });

  it("holds a pending submission back and flags it as awaiting review", async () => {
    await recordActivity();

    await compliance.recomputeAssignment(assignmentId);

    await expect(assignment()).resolves.toMatchObject({
      completedCredits: 0,
      awaitingReviewCount: 1,
      isMissingEvidence: true,
      band: AssociationComplianceBand.NOT_STARTED,
    });
  });

  it("counts the credits once and clears the flag when it is approved", async () => {
    const activity = await recordActivity();
    await compliance.recomputeAssignment(assignmentId);

    await reviews.review(owner(), { activityId: activity.id, approve: true });

    await expect(assignment()).resolves.toMatchObject({
      completedCredits: REQUIRED_CREDITS,
      awaitingReviewCount: 0,
      isMissingEvidence: false,
      band: AssociationComplianceBand.RENEWAL_READY,
    });

    await expect(
      prisma.associationCreditAttribution.count({
        where: { assignmentId, activityId: activity.id },
      }),
    ).resolves.toBe(1);
  });

  it("leaves a rejected submission uncounted and tells the member why", async () => {
    const activity = await recordActivity();
    await compliance.recomputeAssignment(assignmentId);

    await reviews.review(owner(), {
      activityId: activity.id,
      approve: false,
      reason: "The certificate does not name you.",
    });

    await expect(
      prisma.pDUActivity.findUniqueOrThrow({ where: { id: activity.id } }),
    ).resolves.toMatchObject({
      status: PDUStatus.REJECTED,
      reviewNote: "The certificate does not name you.",
    });

    await expect(assignment()).resolves.toMatchObject({
      completedCredits: 0,
      awaitingReviewCount: 0,
    });

    await expect(
      prisma.associationCreditAttribution.findFirstOrThrow({
        where: { assignmentId, activityId: activity.id },
      }),
    ).resolves.toMatchObject({
      state: AssociationAttributionState.REJECTED,
      creditedAmount: 0,
    });
  });

  it("approves once under two simultaneous decisions and refuses the loser", async () => {
    const activity = await recordActivity();
    await compliance.recomputeAssignment(assignmentId);

    const outcomes = await runTogether(2, () =>
      reviews.review(owner(), { activityId: activity.id, approve: true }),
    );

    const refused = rejected(outcomes);

    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
    expect(refused).toHaveLength(1);
    expect(refused[0].reason).toMatchObject({
      response: { code: "ASSOCIATION_ACTIVITY_ALREADY_SETTLED" },
    });

    await expect(auditCount(activity.id)).resolves.toBe(1);
    await expect(assignment()).resolves.toMatchObject({
      completedCredits: REQUIRED_CREDITS,
    });
  });

  it("changes nothing when the recomputation runs a second time", async () => {
    const activity = await recordActivity(PDUStatus.APPROVED);

    await compliance.recomputeAssignment(assignmentId);
    const first = await assignment();

    await compliance.recomputeAssignment(assignmentId);
    const second = await assignment();

    expect(second.completedCredits).toBe(first.completedCredits);
    expect(second.percent).toBe(first.percent);
    expect(second.band).toBe(first.band);

    await expect(
      prisma.associationCreditAttribution.count({
        where: { assignmentId, activityId: activity.id },
      }),
    ).resolves.toBe(1);
  });

  it("refuses a rejection with no reason", async () => {
    const activity = await recordActivity();
    await compliance.recomputeAssignment(assignmentId);

    await expect(
      reviews.review(owner(), { activityId: activity.id, approve: false }),
    ).rejects.toMatchObject({
      response: { code: "ASSOCIATION_REJECTION_REASON_REQUIRED" },
    });

    await expect(auditCount(activity.id)).resolves.toBe(0);
  });
});
