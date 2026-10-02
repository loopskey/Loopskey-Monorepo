import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, Role } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-requirement-audience");

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

type Tenant = {
  ownerId: string;
  associationId: string;
  requirementId: string;
  groupId: string;
};

describe("Association requirement audience (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let requirements: AssociationRequirementService;

  let host: Tenant;
  let stranger: Tenant;

  let hostMemberA: string;
  let hostMemberB: string;
  let strangerMember: string;

  const owner = (tenant: Tenant) => ({
    id: tenant.ownerId,
    role: Role.ASSOCIATION,
  });

  const createTenant = async (label: string): Promise<Tenant> => {
    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email(`${label}-owner`),
        fullName: `Audience ${label} owner`,
        role: Role.ASSOCIATION,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    const association = await prisma.association.create({
      data: {
        name: scope.eventTitle(`${label} institute`),
        ownerId: ownerUser.id,
      },
    });

    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId: association.id,
        createdById: ownerUser.id,
        name: scope.eventTitle(`${label} annual`),
        creditType: CreditType.CPD,
        totalRequiredCredits: 20,
        status: AssociationRequirementStatus.DRAFT,
        evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        deadline: day("2026-12-31"),
      },
    });

    const group = await prisma.associationGroup.create({
      data: {
        associationId: association.id,
        title: scope.eventTitle(`${label} cohort`),
      },
    });

    return {
      ownerId: ownerUser.id,
      associationId: association.id,
      requirementId: requirement.id,
      groupId: group.id,
    };
  };

  const addMember = async (
    tenant: Tenant,
    label: string,
    status: AssociationMemberStatus,
  ) => {
    const user = await prisma.user.create({
      data: {
        email: scope.email(label),
        fullName: `Audience ${label}`,
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    const member = await prisma.associationMember.create({
      data: {
        associationId: tenant.associationId,
        userId: user.id,
        status,
        memberNumber: `A-${label}`,
        invitedAt: new Date(),
      },
    });

    return member.id;
  };

  const targetMemberIds = async (tenant: Tenant) => {
    const rows = await prisma.associationRequirementTarget.findMany({
      where: { requirementId: tenant.requirementId },
      select: { memberId: true, groupId: true },
      orderBy: { memberId: "asc" },
    });

    return rows;
  };

  const codeOf = (error: unknown) => {
    const response = (
      error as { getResponse?: () => { code?: string } }
    ).getResponse?.();
    return response?.code ?? null;
  };

  const setAudience = (tenant: Tenant, memberIds: string[]) =>
    requirements.updateAudience(owner(tenant), {
      requirementId: tenant.requirementId,
      audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
      memberIds,
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    requirements = app.get(AssociationRequirementService);

    host = await createTenant("host");
    stranger = await createTenant("stranger");

    hostMemberA = await addMember(
      host,
      "host-a",
      AssociationMemberStatus.ACTIVE,
    );
    hostMemberB = await addMember(
      host,
      "host-b",
      AssociationMemberStatus.ACTIVE,
    );
    strangerMember = await addMember(
      stranger,
      "stranger-a",
      AssociationMemberStatus.ACTIVE,
    );
  }, 120000);

  afterAll(async () => {
    await scope.cleanup(prisma);
    await app.close();
  }, 60000);

  beforeEach(async () => {
    await prisma.associationRequirementTarget.deleteMany({
      where: { requirementId: host.requirementId },
    });

    await prisma.associationMember.updateMany({
      where: { id: { in: [hostMemberA, hostMemberB] } },
      data: { status: AssociationMemberStatus.ACTIVE },
    });

    await setAudience(host, [hostMemberA]);
  });

  it("refuses a member belonging to another association", async () => {
    await expect(setAudience(host, [strangerMember])).rejects.toMatchObject({
      response: { code: AssociationMessageCode.MEMBER_NOT_FOUND },
    });

    // The refusal rolls the whole transaction back, so the previous audience
    // survives rather than the requirement being left with no targets at all.
    expect(await targetMemberIds(host)).toEqual([
      { memberId: hostMemberA, groupId: null },
    ]);
  });

  it("refuses a mixed selection that smuggles in a foreign member", async () => {
    await expect(
      setAudience(host, [hostMemberB, strangerMember]),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.MEMBER_NOT_FOUND },
    });

    expect(await targetMemberIds(host)).toEqual([
      { memberId: hostMemberA, groupId: null },
    ]);
  });

  it("refuses a group belonging to another association", async () => {
    await expect(
      requirements.updateAudience(owner(host), {
        requirementId: host.requirementId,
        audienceKind: AssociationAudienceKind.GROUP,
        groupIds: [stranger.groupId],
      }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.GROUP_NOT_FOUND },
    });

    expect(await targetMemberIds(host)).toEqual([
      { memberId: hostMemberA, groupId: null },
    ]);
  });

  it("refuses a member deactivated before the save", async () => {
    await prisma.associationMember.update({
      where: { id: hostMemberB },
      data: { status: AssociationMemberStatus.INACTIVE },
    });

    await expect(setAudience(host, [hostMemberB])).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_TARGET_INACTIVE },
    });

    expect(await targetMemberIds(host)).toEqual([
      { memberId: hostMemberA, groupId: null },
    ]);
  });

  it("leaves no partial audience when a deactivation races the save", async () => {
    const outcomes = await runTogether<void>(2, async (index) => {
      if (index === 0) await setAudience(host, [hostMemberB]);
      else
        await prisma.associationMember.update({
          where: { id: hostMemberB },
          data: { status: AssociationMemberStatus.INACTIVE },
        });
    });

    const save = outcomes[0];
    const targets = await targetMemberIds(host);

    // Whichever side wins the row lock, the audience is one of the two whole
    // states — never the emptied set the delete leaves mid-transaction.
    if (save.status === "fulfilled")
      expect(targets).toEqual([{ memberId: hostMemberB, groupId: null }]);
    else {
      expect(codeOf(save.reason)).toBe(
        AssociationMessageCode.REQUIREMENT_TARGET_INACTIVE,
      );
      expect(targets).toEqual([{ memberId: hostMemberA, groupId: null }]);
    }
  }, 60000);

  it("refuses every simultaneous attempt to target a foreign member", async () => {
    const outcomes = await runTogether(3, () =>
      setAudience(host, [strangerMember]),
    );

    expect(outcomes.every((outcome) => outcome.status === "rejected")).toBe(
      true,
    );

    expect(await targetMemberIds(host)).toEqual([
      { memberId: hostMemberA, groupId: null },
    ]);
  }, 60000);
});
