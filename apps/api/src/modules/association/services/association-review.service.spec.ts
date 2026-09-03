import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationReviewService } from "@association/services/association-review.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationAttributionState, AuditAction } from "@prisma/client";
import { AssociationEvidencePolicy, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const attributionRow = (overrides: Record<string, unknown> = {}) => ({
  id: "attr-1",
  state: AssociationAttributionState.AWAITING_REVIEW,
  assignment: {
    id: "assign-1",
    member: { id: "member-1", userId: "user-1" },
    requirement: {
      id: "req-1",
      evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
    },
  },
  ...overrides,
});

const setup = ({
  attribution = attributionRow(),
  settled = true,
  activityExists = true,
}: {
  attribution?: ReturnType<typeof attributionRow> | null;
  settled?: boolean;
  activityExists?: boolean;
} = {}) => {
  const auditCreate = jest.fn().mockResolvedValue({});

  const prisma = {
    associationCreditAttribution: {
      findFirst: jest.fn().mockResolvedValue(attribution),
    },
    auditLog: { create: auditCreate },
  };

  const access = {
    requireOwned: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  const port = {
    activitiesForMembers: jest.fn(),
    activityForOwners: jest
      .fn()
      .mockResolvedValue(activityExists ? { id: "act-1" } : null),
    settleReview: jest.fn().mockResolvedValue(settled),
  };

  const compliance = { recomputeForUser: jest.fn().mockResolvedValue(null) };

  return {
    port,
    prisma,
    access,
    auditCreate,
    compliance,
    service: new AssociationReviewService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      compliance as unknown as AssociationComplianceService,
      port as unknown as ProfessionalComplianceApi,
    ),
  };
};

describe("AssociationReviewService", () => {
  it("refuses a rejection with no reason", async () => {
    const { service, port } = setup();

    await expect(
      service.review(owner, { activityId: "act-1", approve: false }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REJECTION_REASON_REQUIRED },
    });

    expect(port.settleReview).not.toHaveBeenCalled();
  });

  it("refuses an activity that belongs to no member of this association", async () => {
    const { service } = setup({ attribution: null });

    await expect(
      service.review(owner, { activityId: "act-1", approve: true }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACTIVITY_NOT_OWNED },
    });
  });

  it("refuses a decision on a requirement that does not ask for review", async () => {
    const { service } = setup({
      attribution: attributionRow({
        assignment: {
          ...attributionRow().assignment,
          requirement: {
            id: "req-1",
            evidencePolicy: AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
          },
        },
      }),
    });

    await expect(
      service.review(owner, { activityId: "act-1", approve: true }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REVIEW_NOT_PERMITTED },
    });
  });

  it("refuses a second decision on an activity already settled", async () => {
    const { service } = setup({
      attribution: attributionRow({
        state: AssociationAttributionState.COUNTED,
      }),
    });

    await expect(
      service.review(owner, { activityId: "act-1", approve: true }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACTIVITY_ALREADY_SETTLED },
    });
  });

  it("reports an activity that has since disappeared as not reviewable", async () => {
    const { service } = setup({ activityExists: false });

    await expect(
      service.review(owner, { activityId: "act-1", approve: true }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACTIVITY_NOT_REVIEWABLE },
    });
  });

  it("decides through the port's conditional write, scoped to the member's own user id", async () => {
    const { service, port } = setup();

    await service.review(owner, { activityId: "act-1", approve: true });

    expect(port.settleReview).toHaveBeenCalledWith({
      activityId: "act-1",
      ownerUserIds: ["user-1"],
      approve: true,
      reviewNote: null,
    });
  });

  it("gives the loser of a race the already-settled code and writes no audit entry", async () => {
    const { service, auditCreate } = setup({ settled: false });

    await expect(
      service.review(owner, { activityId: "act-1", approve: true }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACTIVITY_ALREADY_SETTLED },
    });

    expect(auditCreate).not.toHaveBeenCalled();
  });

  it("writes exactly one audit entry for a decision that lands", async () => {
    const { service, auditCreate } = setup();

    await service.review(owner, { activityId: "act-1", approve: true });

    expect(auditCreate).toHaveBeenCalledTimes(1);
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: owner.id,
        action: AuditAction.ASSOCIATION_ACTIVITY_APPROVED,
        entityId: "act-1",
      }),
    });
  });

  it("carries the rejection reason to the member's own activity", async () => {
    const { service, port, auditCreate } = setup();

    await service.review(owner, {
      activityId: "act-1",
      approve: false,
      reason: "The certificate does not name you.",
    });

    expect(port.settleReview).toHaveBeenCalledWith(
      expect.objectContaining({
        approve: false,
        reviewNote: "The certificate does not name you.",
      }),
    );
    expect(auditCreate.mock.calls[0][0].data.action).toBe(
      AuditAction.ASSOCIATION_ACTIVITY_REJECTED,
    );
  });

  it("recomputes the member's projection once the decision lands", async () => {
    const { service, compliance } = setup();

    await service.review(owner, { activityId: "act-1", approve: true });

    expect(compliance.recomputeForUser).toHaveBeenCalledWith("user-1");
  });
});
