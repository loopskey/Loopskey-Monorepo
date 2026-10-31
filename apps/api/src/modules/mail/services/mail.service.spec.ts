import type { ConfigService } from "@nestjs/config";

import type {
  OutboxService,
  OutboxWriter,
} from "@infrastructure/outbox/outbox.service";

import { MailService } from "./mail.service";

const append = jest.fn();
const outbox = { append } as unknown as OutboxService;
const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));

describe("MailService configuration", () => {
  it("fails fast when the Resend API key is missing", () => {
    const config = {
      get: jest.fn((name: string) =>
        name === "EMAIL_FROM" ? "LoopsKey <test@example.com>" : undefined,
      ),
    };
    expect(
      () => new MailService(config as unknown as ConfigService, outbox),
    ).toThrow("RESEND_API_KEY is not configured.");
  });

  it("fails fast when the sender is missing", () => {
    const config = {
      get: jest.fn((name: string) =>
        name === "RESEND_API_KEY" ? "re_test" : undefined,
      ),
    };
    expect(
      () => new MailService(config as unknown as ConfigService, outbox),
    ).toThrow("EMAIL_FROM is not configured.");
  });
});

describe("MailService provider receipt", () => {
  const input = {
    to: "invitee@example.test",
    subject: "Invitation",
    html: "<p>Accept your invitation</p>",
    text: "Accept your invitation",
  };
  const createService = () =>
    new MailService(
      {
        get: (name: string) =>
          name === "RESEND_API_KEY" ? "re_test" : "test@example.test",
      } as unknown as ConfigService,
      outbox,
    );

  beforeEach(() => mockSend.mockReset());

  it("keeps the provider receipt and reuses the outbox idempotency key", async () => {
    mockSend.mockResolvedValue({
      data: { id: "provider-message-1" },
      error: null,
    });
    await expect(
      createService().deliver(input, "outbox-event-1"),
    ).resolves.toEqual({ id: "provider-message-1" });
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining(input), {
      idempotencyKey: "outbox-event-1",
    });
  });

  it.each([
    { data: null, error: { name: "validation_error", statusCode: 403 } },
    { data: null, error: null },
    { data: {}, error: null },
  ])(
    "fails delivery rather than reporting success without provider acceptance",
    async (response) => {
      mockSend.mockResolvedValue(response);
      await expect(
        createService().deliver(input, "outbox-event-1"),
      ).rejects.toThrow("Unable to send email. Please try again later.");
    },
  );
});

describe("MailService outbox request", () => {
  it("queues one delivery event through the given transaction writer", async () => {
    const config = {
      get: (name: string) =>
        name === "RESEND_API_KEY" ? "re_test" : "test@example.test",
    };
    const service = new MailService(config as unknown as ConfigService, outbox);
    const writer = {
      outboxEvent: { create: jest.fn() },
    } as unknown as OutboxWriter;
    const input = {
      to: "member@example.test",
      subject: "Welcome",
      html: "<p>Welcome</p>",
      text: "Welcome",
    };
    const receipt = { id: "outbox-event-1" };
    append.mockResolvedValueOnce(receipt);
    mockSend.mockClear();

    await expect(service.sendEmail(input, writer)).resolves.toBe(receipt);
    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "mail.delivery.requested",
        eventVersion: 1,
        aggregateType: "MailDelivery",
        aggregateId: "member@example.test",
        payload: input,
      }),
      writer,
    );
    expect(mockSend).not.toHaveBeenCalled();
  });
});
