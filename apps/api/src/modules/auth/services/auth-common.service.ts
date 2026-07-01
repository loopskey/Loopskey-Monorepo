import { ConfigService } from "@nestjs/config";
import { OtpPurpose } from "@prisma/client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthCommonService {
  constructor(private readonly configService: ConfigService) {}

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  generateOtpCode() {
    const length = Number(this.configService.get<string>("OTP_LENGTH"));
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
      this.configService.get<string>("OTP_EXPIRES_IN_MINUTES"),
    );
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  getOtpResendAfterDate() {
    const seconds = Number(
      this.configService.get<string>("OTP_RESEND_COOLDOWN_SECONDS"),
    );
    return new Date(Date.now() + seconds * 1000);
  }

  getOtpMaxAttempts() {
    return Number(this.configService.get<string>("OTP_MAX_ATTEMPTS"));
  }

  async sendOtpEmail(email: string, code: string, purpose: OtpPurpose) {
    console.log("=================================");
    // eslint-disable-next-line no-console
    console.log(`OTP Email To: ${email}`);
    // eslint-disable-next-line no-console
    console.log(`Purpose: ${purpose}`);
    // eslint-disable-next-line no-console
    console.log(`Code: ${code}`);
    // eslint-disable-next-line no-console
    console.log("=================================");
  }
}
