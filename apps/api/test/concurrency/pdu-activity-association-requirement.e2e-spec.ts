import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, PDUCategory, PDUSource, Role } from "@prisma/client";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { NotFoundException } from "@nestjs/common";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { bootApp, suiteScope } from "../setup/concurrency";

const scope = suiteScope("pdu-association-requirement");

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/**
 * The professional module cannot read association-owned tables (see
 * src/architecture/domain-ownership.ts), so ownership of an
 * `associationRequirementId` is checked against
 * `ProfessionalAssociationRequirementLink`, a read-model the association
 * module pushes through a public port whenever assignment targeting is
 * (re)materialised. This proves the whole path end to end: a real
 * `materialise()` call, the real cross-module push, and the real rejection
 * for a requirement id that belongs to someone else.
 */
describe("PDU activity association-requirement ownership (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pdu: ProfessionalPduService;
  let assignments: AssociationRequirementAssignmentService;

  let ownerId: string;
  let assignedUserId: string;
  let outsiderUserId: string;
  let requirementId: string;

  const assignedUser = () => ({ id: assignedUserId, role: Role.PROFESSIONAL }) as TUser;
  const outsiderUser = () => ({ id: outsiderUserId, role: Role.PROFESSIONAL }) as TUser;

  const activityInput = (overrides: Record<string, unknown> = {}) => ({
    title: "Ownership e2e activity",
    date: day("2026-06-01").toISOString(),
    pdus: 2,
    source: PDUSource.OTHER,
    category: PDUCategory.TECHNICAL,
    creditType: CreditType.CPD,
    reportingYear: 2026,
    providerOrganizer: "Loopskey",
    associationRequirementId: requirementId,
    ...overrides,
  });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    pdu = app.get(ProfessionalPduService);
    assignments = app.get(AssociationRequirementAssignmentService);
    await scope.cleanup(prisma);

    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email("association-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    ownerId = ownerUser.id;

    const assigned = await prisma.user.create({
      data: {
        email: scope.email("assigned-member"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    assignedUserId = assigned.id;

    const outsider = await prisma.user.create({
      data: {
        email: scope.email("outsider"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    outsiderUserId = outsider.id;

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
        userId: assignedUserId,
        status: AssociationMemberStatus.ACTIVE,
      },
    });

    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId: association.id,
        createdById: ownerId,
        name: scope.eventTitle("requirement"),
        creditType: CreditType.CPD,
        totalRequiredCredits: 10,
        deadline: day("2026-12-31"),
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
        targets: {
          create: [{ kind: AssociationAudienceKind.SPECIFIC_MEMBERS, memberId: member.id }],
        },
      },
    });
    requirementId = requirement.id;

    await assignments.materialise(requirementId);
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.pDUActivity.deleteMany({
        where: { userId: { in: [assignedUserId, outsiderUserId] } },
      });
      await prisma.professionalAssociationRequirementLink.deleteMany({
        where: { associationRequirementId: requirementId },
      });
      await prisma.associationRequirementAssignment.deleteMany({
        where: { requirementId },
      });
      await prisma.associationRequirementTarget.deleteMany({
        where: { requirementId },
      });
      await prisma.associationRequirement.deleteMany({
        where: { id: requirementId },
      });
      await scope.cleanup(prisma);
    }
    await app?.close();
  }, 60_000);

  it("pushed the assignment into the professional-owned directory when materialised", async () => {
    const link = await prisma.professionalAssociationRequirementLink.findUnique({
      where: {
        userId_associationRequirementId: {
          userId: assignedUserId,
          associationRequirementId: requirementId,
        },
      },
    });
    expect(link).not.toBeNull();
  });

  it("accepts an activity from the member the requirement is actually assigned to", async () => {
    const created = await pdu.createPduActivity(assignedUser(), activityInput());
    expect(created.associationRequirementId).toBe(requirementId);
  });

  it("rejects an activity from a professional the requirement is not assigned to", async () => {
    await expect(
      pdu.createPduActivity(outsiderUser(), activityInput()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(
      await prisma.pDUActivity.count({ where: { userId: outsiderUserId } }),
    ).toBe(0);
  });

  it("rejects updating an activity to link it to a requirement not assigned to the caller", async () => {
    const own = await pdu.createPduActivity(
      outsiderUser(),
      activityInput({ associationRequirementId: undefined }),
    );

    await expect(
      pdu.updatePduActivity(outsiderUser(), {
        activityId: own.id,
        associationRequirementId: requirementId,
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
