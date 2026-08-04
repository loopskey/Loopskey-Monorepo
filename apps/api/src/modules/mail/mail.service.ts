import { InternalServerErrorException } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";
import { TSendEmailInput } from "@mail/mail-service.type";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { ConfigService } from "@nestjs/config";
import { OutboxWriter } from "@infrastructure/outbox/outbox.service";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly outbox: OutboxService,
  ) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    const from = this.configService.get<string>("EMAIL_FROM");
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
    if (!from) throw new Error("EMAIL_FROM is not configured.");
    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async sendEmail(input: TSendEmailInput, writer?: OutboxWriter) {
    const aggregateId = Array.isArray(input.to) ? input.to.join(",") : input.to;
    return this.outbox.append(
      {
        eventName: "mail.delivery.requested",
        eventVersion: 1,
        aggregateType: "MailDelivery",
        aggregateId,
        payload: input,
        correlationId: requestContext.correlationId(),
      },
      writer,
    );
  }

  async deliver(input: TSendEmailInput) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) {
      this.logger.error("Email provider delivery failed", {
        provider: "resend",
        errorName: error.name ?? "ProviderError",
      });
      throw new InternalServerErrorException({
        code: "EmailSendFailed",
        message: "Unable to send email. Please try again later.",
      });
    }
    return data;
  }
}
