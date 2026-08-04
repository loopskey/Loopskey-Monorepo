import type { ConfigService } from "@nestjs/config";

import { MailService } from "./mail.service";
import type { OutboxService } from "../../infrastructure/outbox/outbox.service";

const outbox = { append: jest.fn() } as unknown as OutboxService;

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
