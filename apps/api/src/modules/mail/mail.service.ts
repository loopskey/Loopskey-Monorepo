import { InternalServerErrorException, Injectable } from "@nestjs/common";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { TSendEmailInput } from "@mail/mail-service.type";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    const from = this.configService.get<string>("EMAIL_FROM");
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
    if (!from) throw new Error("EMAIL_FROM is not configured.");
    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async sendEmail(input: TSendEmailInput) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) {
      console.error("Resend email failed:", error);
      throw new InternalServerErrorException({
        code: AuthMessageCode.EMAIL_SEND_FAILED,
        message: "Unable to send email. Please try again later.",
      });
    }
    return data;
  }
}
