import { AssociationComplianceService } from "@association/services/association-compliance.service";
import {
  AssociationRequirementStatus,
  PDUCategory,
  Role,
} from "@prisma/client";
import { AssociationReportingCycle, CreditType } from "@prisma/client";
import type { OutboxService } from "@infrastructure/outbox/outbox.service";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import type { AssociationAccessService } from "@association/services/association-access.service";
import type { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementService } from "./association-requirement.service";
import { REQUIREMENT_PUBLISHED_EVENT } from "./association-requirement.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };
const association = { id: "assoc-1", name: "Example Association" };

const requirementRow = (over: Record<string, unknown> = {}) => ({
  id: "req-1",
  name: "PMP renewal",
  description: null,
  creditType: CreditType.PDU,
  totalRequiredCredits: 60,
  deadline: new Date("2026-12-31"),
  reportingCycle: AssociationReportingCycle.ONE_TIME,
  cycleLengthYears: null,
  evidencePolicy: "NOT_REQUIRED",
  reportingStart: null,
  reportingEnd: null,
  submissionWindow: "WHOLE_PERIOD",
  gracePeriodDays: 0,
  lateSubmissionPolicy: "ACCEPTED_FLAGGED_LATE",
  renewalCondition: "TOTAL_CREDITS_MET",
  remindersEnabled: false,
  reminderTiming: null,
  audienceKind: "ALL_MEMBERS",
  status: AssociationRequirementStatus.DRAFT,
  publishedAt: null,
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  categories: [],
  targets: [],
  _count: { assignments: 0 },
  ...over,
});

const setup = (
  over: {
    current?: Record<string, unknown>;
    publishCount?: number;
    assignmentCount?: number;
    learningContentCount?: number;
    hasRecordedActivity?: boolean;
    locked?: { id: string; status: AssociationRequirementStatus }[];
    deleteCount?: number;
  } = {},
) => {
  const row = requirementRow(over.current);

  const tx = {
    associationRequirement: {
      updateMany: jest
        .fn()
        .mockResolvedValue({ count: over.publishCount ?? 1 }),
      update: jest.fn().mockResolvedValue(row),
      findUniqueOrThrow: jest.fn().mockResolvedValue(row),
      deleteMany: jest.fn().mockResolvedValue({ count: over.deleteCount ?? 1 }),
    },
    associationRequirementAssignment: {
      count: jest.fn().mockResolvedValue(over.assignmentCount ?? 0),
    },
    associationLearningContent: {
      count: jest.fn().mockResolvedValue(over.learningContentCount ?? 0),
    },
    associationRequirementCategory: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    associationRequirementTarget: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    outboxEvent: { create: jest.fn().mockResolvedValue({ id: "event-1" }) },
    $queryRaw: jest
      .fn()
      .mockResolvedValue(
        over.locked ?? [
          { id: "req-1", status: AssociationRequirementStatus.DRAFT },
        ],
      ),
  };

  const prisma = {
    associationRequirement: {
      findFirst: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };

  const outbox = { append: jest.fn().mockResolvedValue({ id: "event-1" }) };
  const access = {
    requireOwned: jest.fn().mockResolvedValue(association),
    requireReadable: jest.fn().mockResolvedValue(association),
  };
  const assignments = {
    materialise: jest.fn().mockResolvedValue({
      created: 3,
      retained: 0,
      removed: 0,
      retargeted: 0,
    }),
    membersCovered: jest.fn().mockResolvedValue(0),
    hasRecordedActivity: jest
      .fn()
      .mockResolvedValue(over.hasRecordedActivity ?? false),
    retire: jest.fn().mockResolvedValue(undefined),
  };

  const compliance = {
    recomputeRequirement: jest.fn().mockResolvedValue(null),
  };

  return {
    tx,
    prisma,
    outbox,
    compliance,
    assignments,
    service: new AssociationRequirementService(
      prisma as unknown as PrismaService,
      outbox as unknown as OutboxService,
      access as unknown as AssociationAccessService,
      assignments as unknown as AssociationRequirementAssignmentService,
      compliance as unknown as AssociationComplianceService,
    ),
  };
};

describe("AssociationRequirementService publish", () => {
  it("moves the status with a conditional write naming DRAFT", async () => {
    const { service, tx } = setup();

    await service.publish(owner, "req-1");

    expect(tx.associationRequirement.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "req-1",
          status: AssociationRequirementStatus.DRAFT,
        }),
      }),
    );
  });

  it("appends exactly one event, inside the publishing transaction", async () => {
    const { service, outbox, tx } = setup();

    await service.publish(owner, "req-1");

    expect(outbox.append).toHaveBeenCalledTimes(1);
    expect(outbox.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: REQUIREMENT_PUBLISHED_EVENT }),
      tx,
    );
  });

  it("tells the loser of a publish race that it already published", async () => {
    const { service, outbox } = setup({ publishCount: 0 });

    await expect(service.publish(owner, "req-1")).rejects.toMatchObject({
      response: {
        code: AssociationMessageCode.REQUIREMENT_ALREADY_PUBLISHED,
      },
    });
    expect(outbox.append).not.toHaveBeenCalled();
  });

  it("materialises assignments once the transition succeeded", async () => {
    const { service, assignments } = setup();

    await service.publish(owner, "req-1");

    expect(assignments.materialise).toHaveBeenCalledWith("req-1");
  });

  it("refuses to publish a requirement whose categories exceed the total", async () => {
    const { service, outbox } = setup({
      current: {
        totalRequiredCredits: 10,
        categories: [
          {
            id: "cat-1",
            name: "Technical",
            mappedCategory: PDUCategory.TECHNICAL,
            requiredCredits: 40,
            order: 0,
          },
        ],
      },
    });

    await expect(service.publish(owner, "req-1")).rejects.toMatchObject({
      response: {
        code: AssociationMessageCode.CATEGORY_CREDITS_EXCEED_TOTAL,
      },
    });
    expect(outbox.append).not.toHaveBeenCalled();
  });

  it("reports every publish problem at once", async () => {
    const { service } = setup({
      current: { name: " ", totalRequiredCredits: 0, deadline: null },
    });

    await expect(service.publish(owner, "req-1")).rejects.toMatchObject({
      response: {
        code: AssociationMessageCode.PUBLISH_VALIDATION_FAILED,
        details: {
          problems: expect.arrayContaining([
            expect.objectContaining({ field: "name" }),
            expect.objectContaining({ field: "totalRequiredCredits" }),
            expect.objectContaining({ field: "deadline" }),
          ]),
        },
      },
    });
  });
});

describe("AssociationRequirementService immutability after publish", () => {
  const published = { status: AssociationRequirementStatus.PUBLISHED };

  it("refuses a credit-total edit on a published requirement", async () => {
    const { service } = setup({ current: published });

    await expect(
      service.updateDetails(owner, {
        requirementId: "req-1",
        totalRequiredCredits: 80,
      }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_IMMUTABLE_FIELD },
    });
  });

  it("accepts a description edit on a published requirement", async () => {
    const { service, prisma } = setup({ current: published });

    await service.updateDetails(owner, {
      requirementId: "req-1",
      description: "Now with more detail",
    });

    expect(prisma.associationRequirement.update).toHaveBeenCalled();
  });

  it("accepts an audience edit on a published requirement", async () => {
    const { service, assignments } = setup({ current: published });

    await service.updateAudience(owner, {
      requirementId: "req-1",
      audienceKind: "ALL_MEMBERS" as never,
    });

    expect(assignments.materialise).toHaveBeenCalledWith("req-1");
  });

  it("leaves a draft free to change anything", async () => {
    const { service, prisma } = setup();

    await service.updateDetails(owner, {
      requirementId: "req-1",
      totalRequiredCredits: 80,
    });

    expect(prisma.associationRequirement.update).toHaveBeenCalled();
  });
});

describe("AssociationRequirementService cycle rules", () => {
  it("refuses a multi-year cycle with no length", async () => {
    const { service } = setup();

    await expect(
      service.updateDetails(owner, {
        requirementId: "req-1",
        reportingCycle: AssociationReportingCycle.MULTI_YEAR,
      }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.CYCLE_LENGTH_REQUIRED },
    });
  });

  it("accepts a multi-year cycle that names its length", async () => {
    const { service, prisma } = setup();

    await service.updateDetails(owner, {
      requirementId: "req-1",
      reportingCycle: AssociationReportingCycle.MULTI_YEAR,
      cycleLengthYears: 3,
    });

    expect(prisma.associationRequirement.update).toHaveBeenCalled();
  });
});

describe("AssociationRequirementService audience", () => {
  it("refuses a group audience with no group", async () => {
    const { service } = setup();

    await expect(
      service.updateAudience(owner, {
        requirementId: "req-1",
        audienceKind: "GROUP" as never,
      }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.AUDIENCE_EMPTY },
    });
  });

  it("refuses a specific-members audience with no members", async () => {
    const { service } = setup();

    await expect(
      service.updateAudience(owner, {
        requirementId: "req-1",
        audienceKind: "SPECIFIC_MEMBERS" as never,
        memberIds: [],
      }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.AUDIENCE_EMPTY },
    });
  });

  it("replaces the target set rather than adding to it", async () => {
    const { service, tx } = setup();

    await service.updateAudience(owner, {
      requirementId: "req-1",
      audienceKind: "GROUP" as never,
      groupIds: ["group-1"],
    });

    expect(tx.associationRequirementTarget.deleteMany).toHaveBeenCalledWith({
      where: { requirementId: "req-1" },
    });
    expect(tx.associationRequirementTarget.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            requirementId: "req-1",
            groupId: "group-1",
          }),
        ],
      }),
    );
  });

  it("assigns every checked group at once", async () => {
    const { service, tx } = setup();

    await service.updateAudience(owner, {
      requirementId: "req-1",
      audienceKind: "GROUP" as never,
      groupIds: ["group-1", "group-2", "group-3"],
    });

    expect(tx.associationRequirementTarget.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({ groupId: "group-1" }),
          expect.objectContaining({ groupId: "group-2" }),
          expect.objectContaining({ groupId: "group-3" }),
        ],
      }),
    );
  });
});

describe("AssociationRequirementService archive", () => {
  it("stops reminders and refuses a second archive", async () => {
    const { service, tx, assignments } = setup();

    await service.archive(owner, "req-1");

    expect(tx.associationRequirement.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ remindersEnabled: false }),
      }),
    );
    expect(assignments.retire).toHaveBeenCalledWith(tx, "req-1");

    tx.associationRequirement.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.archive(owner, "req-1")).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_ARCHIVED },
    });
  });
});

describe("AssociationRequirementService remove", () => {
  it("permanently deletes an owned draft with no protected history", async () => {
    const { service, tx, assignments } = setup();

    await service.remove(owner, "req-1");

    expect(tx.associationRequirement.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "req-1",
        associationId: association.id,
        status: AssociationRequirementStatus.DRAFT,
      },
    });
    expect(assignments.retire).toHaveBeenCalledWith(tx, "req-1");
  });

  it("does not reveal a requirement owned by another association", async () => {
    const { service } = setup({ locked: [] });

    await expect(service.remove(owner, "req-1")).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_NOT_FOUND },
    });
  });

  it("requires published and archived requirements to use their lifecycle action", async () => {
    const { service } = setup({
      locked: [{ id: "req-1", status: AssociationRequirementStatus.PUBLISHED }],
    });

    await expect(service.remove(owner, "req-1")).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_STATUS_CONFLICT },
    });
  });

  it.each([
    { over: { assignmentCount: 1 }, label: "assignment" },
    { over: { learningContentCount: 1 }, label: "learning content" },
    { over: { hasRecordedActivity: true }, label: "professional activity" },
  ])("preserves a draft with protected $label history", async ({ over }) => {
    const { service, tx } = setup(over);

    await expect(service.remove(owner, "req-1")).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_NOT_DELETABLE },
    });
    expect(tx.associationRequirement.deleteMany).not.toHaveBeenCalled();
  });

  it("rejects a stale conditional delete", async () => {
    const { service } = setup({ deleteCount: 0 });

    await expect(service.remove(owner, "req-1")).rejects.toMatchObject({
      response: { code: AssociationMessageCode.REQUIREMENT_STATUS_CONFLICT },
    });
  });
});
