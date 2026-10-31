import { MailOutboxHandler } from "@mail/application/mail-outbox.handler";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { MailService } from "@mail/services/mail.service";

const event: OutboxEventContext = {
  id: "event-1",
  eventName: "mail.delivery.requested",
  attemptCount: 1,
  correlationId: null,
  idempotencyKey: "outbox-event-1",
  renewLease: async () => undefined,
};

describe("MailOutboxHandler", () => {
  it("registers the mail event and delivers with the outbox idempotency key", async () => {
    const deliver = jest.fn().mockResolvedValue({ id: "provider-message-1" });
    const register = jest.fn();
    const handler = new MailOutboxHandler(
      { deliver } as unknown as MailService,
      { register } as unknown as OutboxHandlerRegistry,
    );
    const payload = {
      to: "member@example.test",
      subject: "Welcome",
      html: "<p>Welcome</p>",
      text: "Welcome",
    };

    handler.onModuleInit();
    await handler.handle(payload, event);

    expect(register).toHaveBeenCalledWith(handler);
    expect(handler.eventName).toBe("mail.delivery.requested");
    expect(handler.lane).toBe("realtime");
    expect(deliver).toHaveBeenCalledWith(payload, "outbox-event-1");
  });
});
