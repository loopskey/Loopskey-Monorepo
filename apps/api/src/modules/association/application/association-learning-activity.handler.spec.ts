import { AssociationLearningActivityHandler } from "@association/application/association-learning-activity.handler";
import { LearningActivityChangeKind } from "@professional/public/professional-compliance-api.events";
import { LEARNING_ACTIVITY_CHANGED_EVENT } from "@professional/public/professional-compliance-api.events";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { AssociationComplianceService } from "@association/services/association-compliance.service";

const payload = (overrides: Record<string, unknown> = {}) => ({
  activityId: "activity-1",
  userId: "user-1",
  changeKind: LearningActivityChangeKind.CREATED,
  revision: "2026-06-01T00:00:00.000Z",
  occurredAt: "2026-06-01T00:00:01.000Z",
  ...overrides,
});

const setup = (outcome = { assignments: 2 }) => {
  const recomputeForUser = jest.fn().mockResolvedValue(outcome);
  const registry = { register: jest.fn() };
  const compliance = { recomputeForUser };

  return {
    recomputeForUser,
    handler: new AssociationLearningActivityHandler(
      registry as unknown as OutboxHandlerRegistry,
      compliance as unknown as AssociationComplianceService,
    ),
  };
};

describe("AssociationLearningActivityHandler", () => {
  it("registers itself for the versioned learning-activity change event", () => {
    const registry = { register: jest.fn() };
    const handler = new AssociationLearningActivityHandler(
      registry as unknown as OutboxHandlerRegistry,
      {
        recomputeForUser: jest.fn(),
      } as unknown as AssociationComplianceService,
    );

    expect(handler.eventName).toBe(LEARNING_ACTIVITY_CHANGED_EVENT);

    handler.onModuleInit();
    expect(registry.register).toHaveBeenCalledWith(handler);
  });

  it("recomputes from the current professional snapshot for every change kind", async () => {
    for (const changeKind of Object.values(LearningActivityChangeKind)) {
      const { handler, recomputeForUser } = setup();
      await handler.handle(payload({ changeKind }));
      expect(recomputeForUser).toHaveBeenCalledWith("user-1");
    }
  });

  it("does nothing for a payload with no user id", async () => {
    const { handler, recomputeForUser } = setup();

    await handler.handle({});
    await handler.handle(null);

    expect(recomputeForUser).not.toHaveBeenCalled();
  });

  it("recomputes from the live snapshot rather than applying the payload as a delta, so a redelivered event is harmless", async () => {
    const { handler, recomputeForUser } = setup();
    const event = payload();

    await handler.handle(event);
    await handler.handle(event);

    // Per-event dedup is the outbox processor's job (OutboxDelivery); the
    // handler's own contribution to idempotency is that it never trusts the
    // payload's snapshot, only the user id, so a second delivery just
    // recomputes the same current truth rather than double-applying a delta.
    expect(recomputeForUser).toHaveBeenCalledTimes(2);
    expect(recomputeForUser).toHaveBeenNthCalledWith(1, "user-1");
    expect(recomputeForUser).toHaveBeenNthCalledWith(2, "user-1");
  });

  it("ignores payload revision/ordering and always recomputes the same user", async () => {
    const { handler, recomputeForUser } = setup();
    const older = payload({ revision: "2026-01-01T00:00:00.000Z" });
    const newer = payload({ revision: "2026-06-01T00:00:00.000Z" });

    await handler.handle(newer);
    await handler.handle(older);

    expect(recomputeForUser).toHaveBeenCalledTimes(2);
    expect(recomputeForUser).toHaveBeenNthCalledWith(1, "user-1");
    expect(recomputeForUser).toHaveBeenNthCalledWith(2, "user-1");
  });
});
