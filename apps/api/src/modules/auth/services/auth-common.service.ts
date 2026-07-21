import { buildOtpEmailTemplate } from "@mail/otp-email.template";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { OtpPurpose } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { buildOrganizationPasswordChangedEmail } from "@mail/organization-email.template";

@Injectable()
export class AuthCommonService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  generateOtpCode() {
    const length = Number(this.configService.get<string>("OTP_LENGTH", "6"));
    const chars = this.configService.get<string>(
      "OTP_CODE_CHARSET",
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    );
    let code = "";
    for (let i = 0; i < length; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  getOtpExpiryDate() {
    const minutes = Number(
      this.configService.get<string>("OTP_EXPIRES_IN_MINUTES", "10"),
    );
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  getOtpResendAfterDate() {
    const seconds = Number(
      this.configService.get<string>("OTP_RESEND_COOLDOWN_SECONDS", "60"),
    );
    return new Date(Date.now() + seconds * 1000);
  }

  getOtpMaxAttempts() {
    return Number(this.configService.get<string>("OTP_MAX_ATTEMPTS", "5"));
  }

  getOtpExpiryMinutes() {
    return Number(
      this.configService.get<string>("OTP_EXPIRES_IN_MINUTES", "10"),
    );
  }

  async sendOtpEmail(email: string, code: string, purpose: OtpPurpose) {
    const appName = this.configService.get<string>("APP_NAME", "LoopsKey");
    const template = buildOtpEmailTemplate({
      code,
      purpose,
      appName,
      expiresInMinutes: this.getOtpExpiryMinutes(),
    });
    await this.mailService.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendOrganizationPasswordChangedEmail(
    email: string,
    organizationName: string,
  ) {
    const template = buildOrganizationPasswordChangedEmail({
      appName: this.configService.get<string>("APP_NAME", "LoopsKey"),
      organizationName,
      supportEmail: this.configService.get<string>(
        "SUPPORT_EMAIL",
        "support@loopskey.com",
      ),
    });
    await this.mailService.sendEmail({ to: email, ...template });
  }
}
