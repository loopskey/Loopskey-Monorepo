import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";
import { ContactInquiryMessageCode } from "@loopskey/api-contracts/error-codes";
import { ContactRateLimiterService } from "@support/services/contact-rate-limiter.service";
import { SubmitContactInquiryInput } from "@support/dtos/submit-contact-inquiry.input";
import { buildContactInquiryEmail } from "@support/templates/contact-email.template";
import { createHash, randomUUID } from "node:crypto";
import { requestContext } from "@infrastructure/observability/request-context";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";

const HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class ContactInquiryService {
  private readonly logger = new Logger(ContactInquiryService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly rateLimiter: ContactRateLimiterService,
  ) {}

  async submitInquiry(input: SubmitContactInquiryInput, clientIp?: string) {
    const correlationId = requestContext.correlationId();
    const recipient = this.recipient();

    this.enforceRateLimit(
      input.email,
      clientIp,
      input.inquiryType,
      correlationId,
    );

    const referenceId = randomUUID();
    const claimKey = this.claimKey(input);
    const isFirstAttempt = this.rateLimiter.claim(
      claimKey,
      this.duplicateWindowMs(),
    );

    if (!isFirstAttempt) {
      this.logger.log("Contact inquiry duplicate suppressed", {
        correlationId,
        inquiryType: input.inquiryType,
      });
      return {
        success: true,
        code: ContactInquiryMessageCode.CONTACT_INQUIRY_SUBMITTED,
        referenceId,
      };
    }

    const email = buildContactInquiryEmail({
      fullName: input.fullName,
      email: input.email,
      organization: input.organization,
      inquiryType: input.inquiryType,
      message: input.message,
      referenceId,
    });

    this.logger.log("Contact inquiry accepted", {
      correlationId,
      referenceId,
      inquiryType: input.inquiryType,
    });

    try {
      await this.mailService.sendEmail({
        to: recipient,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (error) {
      this.rateLimiter.release(claimKey);
      this.logger.error("Contact inquiry delivery request failed", {
        correlationId,
        referenceId,
        inquiryType: input.inquiryType,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      throw new InternalServerErrorException({
        code: ContactInquiryMessageCode.CONTACT_INQUIRY_DELIVERY_FAILED,
        message: "Unable to submit your inquiry right now. Please try again.",
      });
    }

    this.logger.log("Contact inquiry delivery requested", {
      correlationId,
      referenceId,
      inquiryType: input.inquiryType,
    });

    return {
      success: true,
      code: ContactInquiryMessageCode.CONTACT_INQUIRY_SUBMITTED,
      referenceId,
    };
  }

  private enforceRateLimit(
    email: string,
    clientIp: string | undefined,
    inquiryType: string,
    correlationId?: string,
  ) {
    const windowMs = this.windowMs();
    const checks = [
      { key: this.hash(`email:${email}`), limit: this.maxPerEmail() },
      ...(clientIp
        ? [{ key: this.hash(`ip:${clientIp}`), limit: this.maxPerIp() }]
        : []),
    ];

    for (const check of checks) {
      const result = this.rateLimiter.consume(check.key, check.limit, windowMs);
      if (result.allowed) continue;
      this.logger.warn("Contact inquiry rate limited", {
        correlationId,
        inquiryType,
        retryAfterSeconds: result.retryAfterSeconds,
      });
      throw new BadRequestException({
        code: ContactInquiryMessageCode.CONTACT_INQUIRY_RATE_LIMITED,
        message: "Too many inquiries were submitted. Please try again later.",
      });
    }
  }

  private claimKey(input: SubmitContactInquiryInput) {
    if (input.idempotencyKey) return this.hash(`key:${input.idempotencyKey}`);
    return this.hash(
      `content:${input.email}:${input.inquiryType}:${input.message}`,
    );
  }

  private hash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private recipient() {
    const recipient = this.config.get<string>("CONTACT_RECIPIENT_EMAIL");
    if (!recipient)
      throw new Error("CONTACT_RECIPIENT_EMAIL is not configured.");
    return recipient;
  }

  private numericConfig(name: string, fallback: number) {
    const value = Number(this.config.get<string>(name, String(fallback)));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private windowMs() {
    return (
      this.numericConfig("CONTACT_RATE_LIMIT_WINDOW_MINUTES", 60) * 60 * 1000
    );
  }

  private maxPerEmail() {
    return this.numericConfig("CONTACT_MAX_INQUIRIES_PER_EMAIL", 3);
  }

  private maxPerIp() {
    return this.numericConfig("CONTACT_MAX_INQUIRIES_PER_IP", 10);
  }

  private duplicateWindowMs() {
    const minutes = this.numericConfig("CONTACT_DUPLICATE_WINDOW_MINUTES", 5);
    return Math.min(minutes * 60 * 1000, HOUR_MS);
  }
}
