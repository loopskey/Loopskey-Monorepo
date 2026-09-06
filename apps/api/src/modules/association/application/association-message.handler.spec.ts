import { AppLanguage, AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationMessageHandler } from "@association/application/association-message.handler";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationMessageType } from "@prisma/client";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { PrismaService } from "@prisma/prisma.service";

const event: OutboxEventContext = {
  id: "event-1",
  attemptCount: 1,
  correlationId: null,
  eventName: "association.message.requested.v1",
  idempotencyKey: "outbox-event-1",
  renewLease: async () => undefined,
};

const delivery = (overrides: Record<string, unknown> = {}) => ({
  id: "delivery-1",
  state: AssociationMessageDeliveryState.QUEUED,
  language: AppLanguage.EN,
  messageType: AssociationMessageType.BEHIND_THRESHOLD,
  association: { name: "Institute of Practice" },
  member: {
    user: { email: "member-1@example.test", fullName: "Member One" },
  },
  context: {
    percent: 25,
    requiredCredits: 20,
    completedCredits: 5,
    deadline: "2026-12-31T00:00:00.000Z",
    detail: "",
    detailDate: null,
  },
  ...overrides,
});

const setup = ({
  found = delivery(),
  moved = 1,
}: {
  found?: Record<string, unknown> | null;
  moved?: number;
} = {}) => {
  const updateMany = jest.fn().mockResolvedValue({ count: moved });
  const findUnique = jest.fn().mockResolvedValue(found);

  const prisma = {
    associationMessageDelivery: { findUnique, updateMany },
  };

  const mail = { deliver: jest.fn().mockResolvedValue({ id: "resend-1" }) };

  const config = {
    get: jest
      .fn()
      .mockImplementation((key: string, fallback: string) =>
        key === "FRONTEND_URL" ? "https://app.loopskey.test" : fallback,
      ),
  };

  const registry = { register: jest.fn(), resolve: jest.fn() };

  return {
    mail,
    updateMany,
    handler: new AssociationMessageHandler(
      prisma as unknown as PrismaService,
      mail as unknown as MailService,
      config as unknown as ConfigService,
      registry as unknown as OutboxHandlerRegistry,
    ),
  };
};

describe("AssociationMessageHandler", () => {
  it("renders at delivery time and hands the provider the event's idempotency key", async () => {
    const { handler, mail } = setup();

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).toHaveBeenCalledTimes(1);

    const [sent, key] = mail.deliver.mock.calls[0];

    expect(key).toBe("outbox-event-1");
    expect(sent.to).toBe("member-1@example.test");
    expect(sent.subject).toContain("Institute of Practice");
    expect(sent.text).toContain("Member One");
    expect(sent.text).toContain("5 of the 20 credits");
  });

  it("marks the delivery sent with a conditional write naming queued", async () => {
    const { handler, updateMany } = setup();

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "delivery-1",
          state: AssociationMessageDeliveryState.QUEUED,
        },
        data: expect.objectContaining({
          state: AssociationMessageDeliveryState.SENT,
        }),
      }),
    );
  });

  it("sends nothing when a redelivery finds the copy already sent", async () => {
    const { handler, mail, updateMany } = setup({
      found: delivery({ state: AssociationMessageDeliveryState.SENT }),
    });

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("ignores a delivery record that no longer exists", async () => {
    const { handler, mail } = setup({ found: null });

    await expect(
      handler.handle({ deliveryId: "delivery-1" }, event),
    ).resolves.toBeUndefined();
    expect(mail.deliver).not.toHaveBeenCalled();
  });

  it("skips rather than sends when the member has no address left", async () => {
    const { handler, mail, updateMany } = setup({
      found: delivery({
        member: { user: { email: null, fullName: "Member One" } },
      }),
    });

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "delivery-1",
        state: AssociationMessageDeliveryState.QUEUED,
      },
      data: {
        state: AssociationMessageDeliveryState.SKIPPED,
        skipReason: AssociationMessageCode.MESSAGE_NO_RECIPIENTS,
      },
    });
  });

  it("writes French for a French delivery", async () => {
    const { handler, mail } = setup({
      found: delivery({ language: AppLanguage.FR }),
    });

    await handler.handle({ deliveryId: "delivery-1" }, event);

    const [sent] = mail.deliver.mock.calls[0];

    expect(sent.subject).toContain("votre progression est en retard");
    expect(sent.text).toContain("Bonjour Member One");
  });

  it("leaves a terminal failure a user can see when the outbox gives up", async () => {
    const { handler, updateMany } = setup();

    await handler.abandon({ deliveryId: "delivery-1" });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "delivery-1",
        state: AssociationMessageDeliveryState.QUEUED,
      },
      data: {
        state: AssociationMessageDeliveryState.FAILED,
        failureReason: AssociationMessageCode.MESSAGE_DELIVERY_FAILED,
      },
    });
  });

  it("registers itself for its own event", () => {
    const { handler } = setup();

    expect(handler.eventName).toBe("association.message.requested.v1");
    expect(handler.handlerName).toBe("association-message-v1");
  });
});
