import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ContactInquiryMessageCode } from "@loopskey/api-contracts/error-codes";
import { ContactRateLimiterService } from "@support/services/contact-rate-limiter.service";
import { ContactInquiryService } from "@support/services/contact-inquiry.service";
import { SubmitContactInquiryInput } from "@support/dtos/submit-contact-inquiry.input";
import { ContactInquiryType } from "@support/enums/contact-inquiry.enum";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";

const config: Record<string, string> = {
  CONTACT_RECIPIENT_EMAIL: "loopskey.dev@gmail.com",
  CONTACT_RATE_LIMIT_WINDOW_MINUTES: "60",
  CONTACT_MAX_INQUIRIES_PER_EMAIL: "3",
  CONTACT_MAX_INQUIRIES_PER_IP: "10",
  CONTACT_DUPLICATE_WINDOW_MINUTES: "5",
};

const buildInput = (
  overrides: Partial<SubmitContactInquiryInput> = {},
): SubmitContactInquiryInput => ({
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  inquiryType: ContactInquiryType.TECHNICAL_SUPPORT,
  message: "I cannot export my CPD record for this quarter.",
  ...overrides,
});

describe("ContactInquiryService", () => {
  let service: ContactInquiryService;
  let mailService: { sendEmail: jest.Mock };

  beforeEach(() => {
    mailService = { sendEmail: jest.fn().mockResolvedValue(undefined) };
    const configService = {
      get: (key: string, fallback?: string) => config[key] ?? fallback,
    } as unknown as ConfigService;

    service = new ContactInquiryService(
      configService,
      mailService as unknown as MailService,
      new ContactRateLimiterService(),
    );
  });

  it("requests delivery to the configured recipient and returns a reference", async () => {
    const result = await service.submitInquiry(buildInput(), "203.0.113.10");

    expect(result.success).toBe(true);
    expect(result.code).toBe(
      ContactInquiryMessageCode.CONTACT_INQUIRY_SUBMITTED,
    );
    expect(result.referenceId).toEqual(expect.any(String));
    expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(mailService.sendEmail.mock.calls[0][0].to).toBe(
      "loopskey.dev@gmail.com",
    );
  });

  it("fails closed when the recipient is not configured", async () => {
    const configService = {
      get: (key: string, fallback?: string) =>
        key === "CONTACT_RECIPIENT_EMAIL"
          ? undefined
          : (config[key] ?? fallback),
    } as unknown as ConfigService;
    const unconfigured = new ContactInquiryService(
      configService,
      mailService as unknown as MailService,
      new ContactRateLimiterService(),
    );

    await expect(unconfigured.submitInquiry(buildInput())).rejects.toThrow(
      "CONTACT_RECIPIENT_EMAIL is not configured.",
    );
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });

  it("suppresses a duplicate submission instead of delivering twice", async () => {
    const input = buildInput({ idempotencyKey: "submit-1" });

    const first = await service.submitInquiry(input, "203.0.113.10");
    const second = await service.submitInquiry(input, "203.0.113.10");

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("treats an unchanged resubmission without a key as the same inquiry", async () => {
    await service.submitInquiry(buildInput(), "203.0.113.10");
    await service.submitInquiry(buildInput(), "203.0.113.10");

    expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("rate limits repeated inquiries from the same email", async () => {
    for (let index = 0; index < 3; index += 1) {
      await service.submitInquiry(
        buildInput({
          message: `Distinct message number ${index} for testing.`,
        }),
        `198.51.100.${index}`,
      );
    }

    await expect(
      service.submitInquiry(
        buildInput({
          message: "One more distinct message that exceeds limit.",
        }),
        "198.51.100.9",
      ),
    ).rejects.toMatchObject({
      response: {
        code: ContactInquiryMessageCode.CONTACT_INQUIRY_RATE_LIMITED,
      },
    });
    expect(mailService.sendEmail).toHaveBeenCalledTimes(3);
  });

  it("maps a provider failure to a safe code and allows an immediate retry", async () => {
    mailService.sendEmail.mockRejectedValueOnce(
      new Error("resend: connection reset"),
    );
    const input = buildInput({ idempotencyKey: "retry-1" });

    await expect(
      service.submitInquiry(input, "203.0.113.10"),
    ).rejects.toMatchObject({
      response: {
        code: ContactInquiryMessageCode.CONTACT_INQUIRY_DELIVERY_FAILED,
      },
    });

    // The claim was released, so the visitor's retry is delivered rather than
    // silently swallowed as a duplicate.
    const retry = await service.submitInquiry(input, "203.0.113.10");
    expect(retry.success).toBe(true);
    expect(mailService.sendEmail).toHaveBeenCalledTimes(2);
  });

  it("does not leak provider or message detail in the failure response", async () => {
    mailService.sendEmail.mockRejectedValueOnce(
      new Error("resend 502: upstream smtp-relay.internal refused"),
    );

    const error = await service
      .submitInquiry(buildInput(), "203.0.113.10")
      .catch((thrown: InternalServerErrorException) => thrown);

    const serialized = JSON.stringify(
      (error as InternalServerErrorException).getResponse(),
    );
    expect(serialized).not.toContain("smtp-relay.internal");
    expect(serialized).not.toContain("resend");
    expect(serialized).not.toContain("I cannot export my CPD record");
  });

  it("keeps the message body and personal data out of logs", async () => {
    const written: string[] = [];
    jest
      .spyOn(service["logger"], "log")
      .mockImplementation((message: unknown, ...rest: unknown[]) => {
        written.push(JSON.stringify({ message, rest }));
      });

    await service.submitInquiry(buildInput(), "203.0.113.10");

    const serialized = written.join("|");
    expect(serialized).toContain("TECHNICAL_SUPPORT");
    expect(serialized).not.toContain("I cannot export my CPD record");
    expect(serialized).not.toContain("ada@example.com");
    expect(serialized).not.toContain("Ada Lovelace");
    expect(serialized).not.toContain("203.0.113.10");
  });

  it("rejects rate-limited callers before requesting delivery", async () => {
    const limiter = new ContactRateLimiterService();
    jest
      .spyOn(limiter, "consume")
      .mockReturnValue({ allowed: false, retryAfterSeconds: 42 });
    const limited = new ContactInquiryService(
      {
        get: (key: string, fallback?: string) => config[key] ?? fallback,
      } as unknown as ConfigService,
      mailService as unknown as MailService,
      limiter,
    );

    await expect(limited.submitInquiry(buildInput())).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });
});
