import { AssociationSettingsService } from "@association/services/association-settings.service";
import { SETTINGS_RECOMPUTE_EVENT } from "@association/services/association-settings.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationComplianceBand, CreditType, Role } from "@prisma/client";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { overallFor } from "@association/utils/compliance-attribution.util";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const UPDATED_AT = new Date("2026-09-01T10:00:00.000Z");

const storedSettings = (overrides: Record<string, unknown> = {}) => ({
  id: "settings-1",
  associationId: "assoc-1",
  defaultCreditType: CreditType.CPD,
  onTrackThreshold: 70,
  atRiskThreshold: 40,
  renewalRequiresReviewedEvidence: true,
  complianceReminders: true,
  welcomeMessages: true,
  weeklyDigest: true,
  suppressAllEmail: false,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  ...overrides,
});

const assignment = (overrides: Record<string, unknown> = {}) => ({
  memberId: "member-1",
  percent: 50,
  completedCredits: 20,
  awaitingReviewCount: 0,
  requirement: { totalRequiredCredits: 40 },
  ...overrides,
});

const command = (overrides: Record<string, unknown> = {}) => ({
  defaultCreditType: CreditType.CPD,
  onTrackThreshold: 70,
  atRiskThreshold: 40,
  renewalRequiresReviewedEvidence: true,
  expectedUpdatedAt: UPDATED_AT,
  ...overrides,
});

const setup = ({
  settings = storedSettings(),
  assignments = [assignment()],
  updatedCount = 1,
}: {
  settings?: ReturnType<typeof storedSettings>;
  assignments?: ReturnType<typeof assignment>[];
  updatedCount?: number;
} = {}) => {
  const updateMany = jest.fn().mockResolvedValue({ count: updatedCount });
  const auditCreate = jest.fn().mockResolvedValue({ id: "audit-1" });
  const append = jest.fn().mockResolvedValue({ id: "event-1" });

  const client = {
    associationSettings: {
      findUnique: jest.fn().mockResolvedValue(settings),
      findUniqueOrThrow: jest.fn().mockResolvedValue(settings),
      updateMany,
    },
    auditLog: { create: auditCreate },
  };

  const prisma = {
    ...client,
    associationRequirementAssignment: {
      findMany: jest.fn().mockResolvedValue(assignments),
    },
    $transaction: jest
      .fn()
      .mockImplementation((run: (tx: unknown) => unknown) =>
        Promise.resolve(run(client)),
      ),
  };

  const access = {
    requireOwned: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
    requireReadable: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
  };

  return {
    append,
    updateMany,
    auditCreate,
    service: new AssociationSettingsService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      { append } as unknown as OutboxService,
    ),
  };
};

const codeOf = async (run: Promise<unknown>) => {
  try {
    await run;
    return "NO_ERROR";
  } catch (error) {
    const response = (
      error as { getResponse: () => { code?: string } }
    ).getResponse();
    return response.code;
  }
};

describe("AssociationSettingsService thresholds", () => {
  it("refuses an at-risk threshold at or above the on-track threshold", async () => {
    const { service } = setup();

    expect(
      await codeOf(
        service.updateCompliance(
          owner,
          command({ atRiskThreshold: 80, onTrackThreshold: 70 }),
        ),
      ),
    ).toBe(AssociationMessageCode.THRESHOLD_ORDER_INVALID);

    expect(
      await codeOf(
        service.updateCompliance(
          owner,
          command({ atRiskThreshold: 70, onTrackThreshold: 70 }),
        ),
      ),
    ).toBe(AssociationMessageCode.THRESHOLD_ORDER_INVALID);
  });

  it("refuses a threshold outside one to a hundred, or a fraction", async () => {
    const { service } = setup();

    for (const patch of [
      { onTrackThreshold: 0, atRiskThreshold: 0 },
      { onTrackThreshold: 101 },
      { onTrackThreshold: 70.5 },
    ])
      expect(
        await codeOf(service.updateCompliance(owner, command(patch))),
      ).toBe(AssociationMessageCode.THRESHOLD_OUT_OF_RANGE);
  });

  it("writes nothing when the threshold pair is refused", async () => {
    const { service, updateMany } = setup();

    await codeOf(
      service.updateCompliance(owner, command({ atRiskThreshold: 90 })),
    );

    expect(updateMany).not.toHaveBeenCalled();
  });
});

describe("AssociationSettingsService dry run", () => {
  const twoMembers = [
    assignment({
      memberId: "member-1",
      percent: 50,
      completedCredits: 20,
      requirement: { totalRequiredCredits: 40 },
    }),
    assignment({
      memberId: "member-2",
      percent: 90,
      completedCredits: 36,
      requirement: { totalRequiredCredits: 40 },
    }),
  ];

  it("counts the members whose band the new threshold moves", async () => {
    const { service, updateMany } = setup({ assignments: twoMembers });

    const outcome = await service.updateCompliance(
      owner,
      command({ onTrackThreshold: 40, atRiskThreshold: 20, dryRun: true }),
    );

    expect(outcome.applied).toBe(false);
    expect(outcome.impact.totalMembers).toBe(2);
    expect(outcome.impact.membersChangingBand).toBe(1);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("matches the reclassification the same function performs", async () => {
    const { service } = setup({ assignments: twoMembers });

    const outcome = await service.updateCompliance(
      owner,
      command({ onTrackThreshold: 40, atRiskThreshold: 20, dryRun: true }),
    );

    const reclassified = twoMembers.filter((one) => {
      const shape = [
        {
          requiredCredits: one.requirement.totalRequiredCredits,
          completedCredits: one.completedCredits,
          awaitingReviewCount: one.awaitingReviewCount,
        },
      ];

      return (
        overallFor({ assignments: shape, onTrackThreshold: 70 }).band !==
        overallFor({ assignments: shape, onTrackThreshold: 40 }).band
      );
    });

    expect(outcome.impact.membersChangingBand).toBe(reclassified.length);
    expect(
      overallFor({
        assignments: [
          { requiredCredits: 40, completedCredits: 20, awaitingReviewCount: 0 },
        ],
        onTrackThreshold: 40,
      }).band,
    ).toBe(AssociationComplianceBand.ON_TRACK);
  });

  it("counts who joins the at-risk list when that threshold moves", async () => {
    const { service } = setup({ assignments: twoMembers });

    const outcome = await service.updateCompliance(
      owner,
      command({ atRiskThreshold: 60, dryRun: true }),
    );

    expect(outcome.impact.membersEnteringAtRisk).toBe(1);
    expect(outcome.impact.membersLeavingAtRisk).toBe(0);
  });
});

describe("AssociationSettingsService concurrency", () => {
  it("tells the loser of a race that the settings changed", async () => {
    const { service } = setup({ updatedCount: 0 });

    expect(await codeOf(service.updateCompliance(owner, command()))).toBe(
      AssociationMessageCode.SETTINGS_STALE,
    );
  });

  it("names the timestamp it expected in the conditional write", async () => {
    const { service, updateMany } = setup();

    await service.updateCompliance(owner, command({ onTrackThreshold: 75 }));

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { associationId: "assoc-1", updatedAt: UPDATED_AT },
      }),
    );
  });

  it("refuses a stale notification save too", async () => {
    const { service } = setup({ updatedCount: 0 });

    expect(
      await codeOf(
        service.updateNotifications(owner, {
          complianceReminders: true,
          welcomeMessages: true,
          weeklyDigest: false,
          suppressAllEmail: true,
          expectedUpdatedAt: UPDATED_AT,
        }),
      ),
    ).toBe(AssociationMessageCode.SETTINGS_STALE);
  });
});

describe("AssociationSettingsService recomputation", () => {
  it("queues reclassification only when the on-track threshold moves", async () => {
    const moved = setup();
    await moved.service.updateCompliance(
      owner,
      command({ onTrackThreshold: 75 }),
    );
    expect(moved.append).toHaveBeenCalledTimes(1);
    expect(moved.append.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        eventName: SETTINGS_RECOMPUTE_EVENT,
        payload: { associationId: "assoc-1" },
      }),
    );

    const unmoved = setup();
    await unmoved.service.updateCompliance(
      owner,
      command({ atRiskThreshold: 35 }),
    );
    expect(unmoved.append).not.toHaveBeenCalled();
  });

  it("audits the previous and the new numeric settings", async () => {
    const { service, auditCreate } = setup();

    await service.updateCompliance(owner, command({ onTrackThreshold: 75 }));

    const { metadata } = auditCreate.mock.calls[0][0].data;

    expect(metadata.previous.onTrackThreshold).toBe(70);
    expect(metadata.next.onTrackThreshold).toBe(75);
    expect(metadata.section).toBe("compliance");
  });
});

describe("AssociationSettingsService suppression", () => {
  it("reports the stored switch to the message service", async () => {
    const on = setup({ settings: storedSettings({ suppressAllEmail: true }) });
    expect(await on.service.suppressesEmail("assoc-1")).toBe(true);

    const off = setup();
    expect(await off.service.suppressesEmail("assoc-1")).toBe(false);
  });
});
