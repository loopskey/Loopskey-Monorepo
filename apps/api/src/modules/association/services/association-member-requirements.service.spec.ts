import { AssociationMemberRequirementsService } from "@association/services/association-member-requirements.service";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationAudienceKind } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const requirementRow = (overrides: Record<string, unknown> = {}) => ({
  id: "req-1",
  name: "Annual CPD",
  deadline: null,
  creditType: "CPD",
  totalRequiredCredits: 40,
  audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
  targets: [{ memberId: "member-2" }],
  assignments: [],
  ...overrides,
});

const setup = ({
  requirements = [requirementRow()],
  member = { id: "member-1" },
}: {
  requirements?: ReturnType<typeof requirementRow>[];
  member?: { id: string } | null;
} = {}) => {
  const prisma = {
    associationMember: { findFirst: jest.fn().mockResolvedValue(member) },
    associationRequirement: {
      findMany: jest.fn().mockResolvedValue(requirements),
    },
  };

  const access = {
    requireOwned: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
    requireReadable: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  const requirementService = {
    updateAudience: jest.fn().mockResolvedValue({}),
  };

  return {
    prisma,
    access,
    requirementService,
    service: new AssociationMemberRequirementsService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      requirementService as unknown as AssociationRequirementService,
    ),
  };
};

describe("AssociationMemberRequirementsService", () => {
  describe("the options a change dialog offers", () => {
    it("marks an assignment the member already has", async () => {
      const { service } = setup({
        requirements: [requirementRow({ assignments: [{ id: "assign-1" }] })],
      });

      await expect(service.options(owner, "member-1")).resolves.toEqual([
        expect.objectContaining({ isAssigned: true, isMemberManaged: true }),
      ]);
    });

    it("says a group audience is not decided per member", async () => {
      const { service } = setup({
        requirements: [
          requirementRow({ audienceKind: AssociationAudienceKind.GROUP }),
        ],
      });

      await expect(service.options(owner, "member-1")).resolves.toEqual([
        expect.objectContaining({ isMemberManaged: false }),
      ]);
    });

    it("refuses a member of another association", async () => {
      const { service } = setup({ member: null });

      await expect(service.options(owner, "member-9")).rejects.toMatchObject({
        response: { code: AssociationMessageCode.MEMBER_NOT_FOUND },
      });
    });
  });

  describe("changing what is assigned", () => {
    it("adds the member to a specific-members audience and counts the change", async () => {
      const { service, requirementService } = setup();

      await expect(
        service.setRequirements(owner, {
          memberId: "member-1",
          requirementIds: ["req-1"],
        }),
      ).resolves.toEqual({ memberId: "member-1", added: 1, removed: 0 });

      expect(requirementService.updateAudience).toHaveBeenCalledWith(owner, {
        requirementId: "req-1",
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        memberIds: ["member-2", "member-1"],
      });
    });

    it("removes the member while leaving the rest of the audience alone", async () => {
      const { service, requirementService } = setup({
        requirements: [
          requirementRow({
            targets: [{ memberId: "member-1" }, { memberId: "member-2" }],
            assignments: [{ id: "assign-1" }],
          }),
        ],
      });

      await expect(
        service.setRequirements(owner, {
          memberId: "member-1",
          requirementIds: [],
        }),
      ).resolves.toEqual({ memberId: "member-1", added: 0, removed: 1 });

      expect(requirementService.updateAudience).toHaveBeenCalledWith(owner, {
        requirementId: "req-1",
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        memberIds: ["member-2"],
      });
    });

    it("changes nothing when the assignment already matches", async () => {
      const { service, requirementService } = setup({
        requirements: [requirementRow({ assignments: [{ id: "assign-1" }] })],
      });

      await expect(
        service.setRequirements(owner, {
          memberId: "member-1",
          requirementIds: ["req-1"],
        }),
      ).resolves.toEqual({ memberId: "member-1", added: 0, removed: 0 });
      expect(requirementService.updateAudience).not.toHaveBeenCalled();
    });

    it("refuses to move a member in or out of an audience the requirement decides", async () => {
      const { service, requirementService } = setup({
        requirements: [
          requirementRow({ audienceKind: AssociationAudienceKind.ALL_MEMBERS }),
        ],
      });

      await expect(
        service.setRequirements(owner, {
          memberId: "member-1",
          requirementIds: ["req-1"],
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.AUDIENCE_NOT_MEMBER_MANAGED },
      });
      expect(requirementService.updateAudience).not.toHaveBeenCalled();
    });

    it("refuses a requirement that is not published here", async () => {
      const { service } = setup();

      await expect(
        service.setRequirements(owner, {
          memberId: "member-1",
          requirementIds: ["req-9"],
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.REQUIREMENT_NOT_FOUND },
      });
    });
  });
});
