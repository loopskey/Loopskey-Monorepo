import { AssociationLearningContentRecipientService } from "@association/services/association-learning-content-recipient.service";
import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationLearningContentService } from "@association/services/association-learning-content.service";
import { AssociationMyRequirementsService } from "@association/services/association-my-requirements.service";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationLateSubmissionPolicy } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, PDUCategory, PDUSource, PDUStatus } from "@prisma/client";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { INestApplication } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { bootApp, fulfilled, rejected } from "../setup/concurrency";
import { runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-content-sync");

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("Association learning content and professional activity stay in step (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pdu: ProfessionalPduService;
  let content: AssociationLearningContentService;
  let recipients: AssociationLearningContentRecipientService;
  let assignments: AssociationRequirementAssignmentService;
  let requirements: AssociationRequirementService;
  let compliance: AssociationComplianceService;
  let myRequirements: AssociationMyRequirementsService;

  let ownerId: string;
  let userAId: string;
  let userBId: string;
  let userInactiveId: string;
  let outsiderId: string;
  let associationId: string;
  let requirementOneId: string;
  let requirementTwoId: string;
  let requirementReportingId: string;
  const contentIds: string[] = [];

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });
  const userA = () => ({ id: userAId, role: Role.PROFESSIONAL }) as TUser;
  const userB = () => ({ id: userBId, role: Role.PROFESSIONAL }) as TUser;
  const outsider = () => ({ id: outsiderId, role: Role.PROFESSIONAL }) as TUser;

  const activityInput = (overrides: Record<string, unknown> = {}) => ({
    title: "Content sync e2e activity",
    date: day("2026-06-01").toISOString(),
    pdus: 2,
    source: PDUSource.OTHER,
    category: PDUCategory.TECHNICAL,
    creditType: CreditType.CPD,
    reportingYear: 2026,
    providerOrganizer: "Loopskey",
    ...overrides,
  });

  const publishRequirement = async (
    name: string,
    overrides: Partial<Prisma.AssociationRequirementUncheckedCreateInput> = {},
  ) => {
    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId,
        createdById: ownerId,
        name: scope.eventTitle(name),
        creditType: CreditType.CPD,
        totalRequiredCredits: 10,
        deadline: day("2026-12-31"),
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
        ...overrides,
      },
    });
    await assignments.materialise(requirement.id);
    return requirement.id;
  };

  const publishItem = async (requirementId: string | null) => {
    const created = await content.create(owner(), {
      externalTitle: scope.eventTitle("item"),
      externalUrl: "https://example.test/item",
      ...(requirementId ? { requirementId } : {}),
    });
    contentIds.push(created.id);
    await content.publish(owner(), {
      learningContentId: created.id,
      audienceKind: AssociationAudienceKind.ALL_MEMBERS,
    });
    await recipients.syncContent(created.id);
    return created.id;
  };

  const linkOf = (userId: string, learningContentId: string) =>
    prisma.professionalAssociationContentLink.findUnique({
      where: { userId_learningContentId: { userId, learningContentId } },
    });

  const moveItem = (learningContentId: string, requirementId: string | null) =>
    content.update(owner(), {
      learningContentId,
      externalTitle: scope.eventTitle("item"),
      externalUrl: "https://example.test/item",
      ...(requirementId ? { requirementId } : {}),
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    pdu = app.get(ProfessionalPduService);
    content = app.get(AssociationLearningContentService);
    recipients = app.get(AssociationLearningContentRecipientService);
    assignments = app.get(AssociationRequirementAssignmentService);
    requirements = app.get(AssociationRequirementService);
    compliance = app.get(AssociationComplianceService);
    myRequirements = app.get(AssociationMyRequirementsService);
    await scope.cleanup(prisma);

    const createUser = async (name: string, role: Role) =>
      (
        await prisma.user.create({
          data: { email: scope.email(name), role, status: "ACTIVE" },
        })
      ).id;

    ownerId = await createUser("owner", Role.ASSOCIATION);
    userAId = await createUser("member-a", Role.PROFESSIONAL);
    userBId = await createUser("member-b", Role.PROFESSIONAL);
    userInactiveId = await createUser("member-inactive", Role.PROFESSIONAL);
    outsiderId = await createUser("outsider", Role.PROFESSIONAL);

    const association = await prisma.association.create({
      data: {
        name: scope.eventTitle("association"),
        ownerId,
        settings: { create: { onTrackThreshold: 70, atRiskThreshold: 40 } },
      },
    });
    associationId = association.id;

    await prisma.associationMember.createMany({
      data: [
        { userId: userAId, status: AssociationMemberStatus.ACTIVE },
        { userId: userBId, status: AssociationMemberStatus.ACTIVE },
        { userId: userInactiveId, status: AssociationMemberStatus.INACTIVE },
      ].map((member) => ({ associationId, ...member })),
    });

    requirementOneId = await publishRequirement("requirement one");
    requirementTwoId = await publishRequirement("requirement two");
    requirementReportingId = await publishRequirement("reporting", {
      lateSubmissionPolicy: AssociationLateSubmissionPolicy.NOT_ACCEPTED,
    });
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      const users = [userAId, userBId, userInactiveId, outsiderId];
      await prisma.pDUActivity.deleteMany({ where: { userId: { in: users } } });
      await prisma.professionalAssociationContentLink.deleteMany({
        where: { learningContentId: { in: contentIds } },
      });
      await prisma.associationLearningContent.deleteMany({
        where: { associationId },
      });
      await prisma.associationRequirement.deleteMany({
        where: { associationId },
      });
      await prisma.associationMember.deleteMany({ where: { associationId } });
      await prisma.association.deleteMany({ where: { id: associationId } });
      await scope.cleanup(prisma);
    }
    await app?.close();
  }, 60_000);

  describe("who may complete an item", () => {
    it("links every active audience member, with the requirement the item counts toward, and nobody else", async () => {
      const itemId = await publishItem(requirementOneId);

      expect(await linkOf(userAId, itemId)).toMatchObject({
        requirementId: requirementOneId,
      });
      expect(await linkOf(userBId, itemId)).toMatchObject({
        requirementId: requirementOneId,
      });
      expect(await linkOf(userInactiveId, itemId)).toBeNull();
      expect(await linkOf(outsiderId, itemId)).toBeNull();
    });

    it("records a completion for an audience member and refuses a professional who was never offered the item", async () => {
      const itemId = await publishItem(requirementOneId);

      const created = await pdu.createPduActivity(
        userA(),
        activityInput({
          associationRequirementId: requirementOneId,
          associationLearningContentId: itemId,
        }),
      );
      expect(created.associationLearningContentId).toBe(itemId);

      await expect(
        pdu.createPduActivity(
          outsider(),
          activityInput({ associationLearningContentId: itemId }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(
        await prisma.pDUActivity.count({ where: { userId: outsiderId } }),
      ).toBe(0);
    });

    it("refuses a requirement other than the one the item counts toward", async () => {
      const itemId = await publishItem(requirementOneId);

      await expect(
        pdu.createPduActivity(
          userA(),
          activityInput({
            associationRequirementId: requirementTwoId,
            associationLearningContentId: itemId,
          }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("stops offering an item the moment it is withdrawn", async () => {
      const itemId = await publishItem(null);
      expect(await linkOf(userAId, itemId)).not.toBeNull();

      await content.withdraw(owner(), itemId);

      expect(await linkOf(userAId, itemId)).toBeNull();
      await expect(
        pdu.createPduActivity(
          userA(),
          activityInput({ associationLearningContentId: itemId }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("drops a member's links when they are deactivated and restores them when they return", async () => {
      const itemId = await publishItem(null);
      const member = await prisma.associationMember.findFirstOrThrow({
        where: { associationId, userId: userBId },
      });

      await prisma.associationMember.update({
        where: { id: member.id },
        data: { status: AssociationMemberStatus.INACTIVE },
      });
      await recipients.syncMember(member.id);
      expect(await linkOf(userBId, itemId)).toBeNull();

      await prisma.associationMember.update({
        where: { id: member.id },
        data: { status: AssociationMemberStatus.ACTIVE },
      });
      await recipients.syncMember(member.id);
      expect(await linkOf(userBId, itemId)).not.toBeNull();
    });
  });

  describe("one completion per member per item", () => {
    it("lets the database refuse a second external-content activity for the same item", async () => {
      const itemId = await publishItem(null);
      const row = {
        userId: userAId,
        title: "duplicate",
        category: PDUCategory.TECHNICAL,
        pdus: 1,
        date: day("2026-06-01"),
        associationLearningContentId: itemId,
      };

      await prisma.pDUActivity.create({ data: row });

      await expect(
        prisma.pDUActivity.create({ data: row }),
      ).rejects.toMatchObject({ code: "P2002" });
    });

    it("converges eight simultaneous completions of one external item on a single activity", async () => {
      const itemId = await publishItem(null);

      const results = await runTogether(8, () =>
        pdu.createPduActivity(
          userA(),
          activityInput({ associationLearningContentId: itemId }),
        ),
      );

      expect(rejected(results)).toHaveLength(0);
      expect(
        new Set(fulfilled(results).map((result) => result.value.id)).size,
      ).toBe(1);
      expect(
        await prisma.pDUActivity.count({
          where: { userId: userAId, associationLearningContentId: itemId },
        }),
      ).toBe(1);
    }, 30_000);

    it("returns a rejected activity to pending review when the member submits it again", async () => {
      const itemId = await publishItem(null);
      const first = await pdu.createPduActivity(
        userB(),
        activityInput({ associationLearningContentId: itemId }),
      );
      await prisma.pDUActivity.update({
        where: { id: first.id },
        data: { status: PDUStatus.REJECTED, reviewNote: "Wrong certificate" },
      });

      const second = await pdu.createPduActivity(
        userB(),
        activityInput({ associationLearningContentId: itemId, pdus: 3 }),
      );

      expect(second.id).toBe(first.id);
      expect(second).toMatchObject({
        pdus: 3,
        reviewNote: null,
        status: PDUStatus.PENDING,
      });
    });
  });

  describe("moving an item to another requirement", () => {
    it("moves the member links with the item when nobody has completed it", async () => {
      const itemId = await publishItem(requirementOneId);

      await moveItem(itemId, requirementTwoId);

      expect(await linkOf(userAId, itemId)).toMatchObject({
        requirementId: requirementTwoId,
      });
      expect(
        (
          await prisma.associationLearningContent.findUniqueOrThrow({
            where: { id: itemId },
          })
        ).requirementId,
      ).toBe(requirementTwoId);
    });

    it("refuses the move once a member has completed the item, and changes nothing", async () => {
      const itemId = await publishItem(requirementOneId);
      await pdu.createPduActivity(
        userA(),
        activityInput({
          associationRequirementId: requirementOneId,
          associationLearningContentId: itemId,
        }),
      );

      await expect(moveItem(itemId, requirementTwoId)).rejects.toMatchObject({
        response: {
          code: AssociationMessageCode.LEARNING_CONTENT_REQUIREMENT_LOCKED,
        },
      });

      expect(await linkOf(userAId, itemId)).toMatchObject({
        requirementId: requirementOneId,
      });
      expect(
        (
          await prisma.associationLearningContent.findUniqueOrThrow({
            where: { id: itemId },
          })
        ).requirementId,
      ).toBe(requirementOneId);
    });

    it("never leaves a completion against one requirement under an item that moved to another", async () => {
      const outcomes: string[] = [];

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const itemId = await publishItem(requirementOneId);

        await runTogether(2, async (index) => {
          if (index === 0)
            await pdu.createPduActivity(
              userA(),
              activityInput({
                title: `race ${attempt}`,
                associationRequirementId: requirementOneId,
                associationLearningContentId: itemId,
              }),
            );
          else await moveItem(itemId, requirementTwoId);
        });

        const recorded = await prisma.pDUActivity.count({
          where: { userId: userAId, associationLearningContentId: itemId },
        });
        const stored =
          await prisma.associationLearningContent.findUniqueOrThrow({
            where: { id: itemId },
          });
        const link = await linkOf(userAId, itemId);

        if (recorded === 1) {
          expect(stored.requirementId).toBe(requirementOneId);
          expect(link?.requirementId).toBe(requirementOneId);
          outcomes.push("completed-first");
        } else {
          expect(stored.requirementId).toBe(requirementTwoId);
          expect(link?.requirementId).toBe(requirementTwoId);
          outcomes.push("moved-first");
        }
      }

      expect(outcomes).toHaveLength(6);
    }, 60_000);
  });

  describe("what both sides read back", () => {
    it("gives the member the completion date, the submission date and what the requirement counted", async () => {
      const itemId = await publishItem(requirementOneId);
      const created = await pdu.createPduActivity(
        userB(),
        activityInput({
          associationRequirementId: requirementOneId,
          associationLearningContentId: itemId,
        }),
      );
      await compliance.recomputeForUser(userBId);

      const detail = await myRequirements.one(userBId, requirementOneId);
      const item = detail.learningContents.find((entry) => entry.id === itemId);

      expect(item).toMatchObject({
        isCompleted: true,
        creditedAmount: 2,
        completedAt: day("2026-06-01"),
        submittedAt: created.createdAt,
        completionState: AssociationAttributionState.COUNTED,
      });
    });

    it("shows a rejected completion as rejected rather than done", async () => {
      const itemId = await publishItem(requirementOneId);
      const created = await pdu.createPduActivity(
        userA(),
        activityInput({
          associationRequirementId: requirementOneId,
          associationLearningContentId: itemId,
        }),
      );
      await prisma.pDUActivity.update({
        where: { id: created.id },
        data: { status: PDUStatus.REJECTED },
      });
      await compliance.recomputeForUser(userAId);

      const detail = await myRequirements.one(userAId, requirementOneId);
      const item = detail.learningContents.find((entry) => entry.id === itemId);

      expect(item?.completionState).toBe(AssociationAttributionState.REJECTED);
    });

    it("counts engagement from the audience's accepted completions only", async () => {
      const itemId = await publishItem(null);
      const accepted = await pdu.createPduActivity(
        userA(),
        activityInput({ associationLearningContentId: itemId, pdus: 3 }),
      );
      const rejectedOne = await pdu.createPduActivity(
        userB(),
        activityInput({ associationLearningContentId: itemId, pdus: 5 }),
      );
      await prisma.pDUActivity.update({
        where: { id: rejectedOne.id },
        data: { status: PDUStatus.REJECTED },
      });
      await prisma.pDUActivity.create({
        data: {
          userId: userInactiveId,
          title: "left the association",
          category: PDUCategory.TECHNICAL,
          pdus: 7,
          date: day("2026-06-01"),
          associationLearningContentId: itemId,
        },
      });

      const item = await content.one(owner(), itemId);

      expect(accepted.id).toBeDefined();
      expect(item.engagement).toEqual({ memberCount: 1, credits: 3 });
    });

    it("reports an external item's engagement instead of nothing", async () => {
      const itemId = await publishItem(null);
      await pdu.createPduActivity(
        userA(),
        activityInput({ associationLearningContentId: itemId }),
      );

      const item = await content.one(owner(), itemId);

      expect(item.status).toBe(AssociationLearningContentStatus.PUBLISHED);
      expect(item.engagement).toEqual({ memberCount: 1, credits: 2 });
    });
  });

  describe("reporting rules of a published requirement", () => {
    it("refuses to move the reporting start", async () => {
      await expect(
        requirements.updateReportingRules(owner(), {
          requirementId: requirementReportingId,
          reportingStart: day("2026-02-01"),
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.REQUIREMENT_IMMUTABLE_FIELD },
      });
    });

    it("recomputes member credit when the reporting end moves before an activity", async () => {
      await pdu.createPduActivity(
        userA(),
        activityInput({
          title: "window",
          associationRequirementId: requirementReportingId,
        }),
      );
      await compliance.recomputeRequirement(requirementReportingId);

      const before =
        await prisma.associationRequirementAssignment.findFirstOrThrow({
          where: {
            requirementId: requirementReportingId,
            member: { userId: userAId },
          },
        });
      expect(before.completedCredits).toBeGreaterThanOrEqual(2);
      expect(
        await prisma.associationCreditAttribution.count({
          where: { assignmentId: before.id },
        }),
      ).toBeGreaterThan(0);

      await requirements.updateReportingRules(owner(), {
        requirementId: requirementReportingId,
        reportingEnd: day("2026-05-01"),
      });

      const after =
        await prisma.associationRequirementAssignment.findUniqueOrThrow({
          where: { id: before.id },
        });
      expect(after.completedCredits).toBe(0);
      expect(
        await prisma.associationCreditAttribution.count({
          where: { assignmentId: before.id },
        }),
      ).toBe(0);
    });
  });
});
