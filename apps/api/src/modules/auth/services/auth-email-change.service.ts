import { BadRequestException, Injectable } from "@nestjs/common";
import { RequestEmailChangeInput } from "@auth/dtos/request-email-change.input";
import { OtpPurpose, UserStatus } from "@prisma/client";
import { VerifyEmailChangeInput } from "@auth/dtos/verify-email-change.input";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";

import * as argon2 from "argon2";

@Injectable()
export class AuthEmailChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authCommon: AuthCommonService,
  ) {}

  async requestEmailChange(userId: string, input: RequestEmailChangeInput) {
    const newEmail = this.authCommon.normalizeEmail(input.newEmail);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, status: true },
    });
    if (!user)
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    if (user.status !== UserStatus.ACTIVE)
      throw new BadRequestException({
        code: AuthMessageCode.USER_DISABLED,
        message: "User is not active.",
      });
    if (user.email === newEmail)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "New email must be different from current email.",
      });
    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (existing)
      throw new BadRequestException({
        code: AuthMessageCode.EMAIL_ALREADY_EXISTS,
        message: "Email is already in use.",
      });
    const otpCode = this.authCommon.generateOtpCode();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: newEmail,
        codeHash: await argon2.hash(otpCode),
        purpose: OtpPurpose.CHANGE_EMAIL,
        expiresAt: this.authCommon.getOtpExpiryDate(),
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        maxAttempts: this.authCommon.getOtpMaxAttempts(),
      },
    });
    await this.authCommon.sendOtpEmail(
      newEmail,
      otpCode,
      OtpPurpose.CHANGE_EMAIL,
    );
    return {
      success: true,
      code: AuthMessageCode.EMAIL_CHANGE_OTP_SENT,
      message: "Email change code has been sent.",
      user: null,
    };
  }

  async verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
    const newEmail = this.authCommon.normalizeEmail(input.newEmail);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, status: true },
    });
    if (!user)
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        destination: newEmail,
        purpose: OtpPurpose.CHANGE_EMAIL,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
    if (!otp)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "OTP not found.",
      });
    if (otp.attempts >= otp.maxAttempts)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_ATTEMPTS_EXCEEDED,
        message: "OTP attempts exceeded.",
      });
    if (otp.expiresAt < new Date())
      throw new BadRequestException({
        code: AuthMessageCode.OTP_EXPIRED,
        message: "OTP has expired.",
      });
    const isValidOtp = await argon2.verify(otp.codeHash, input.code.trim());
    if (!isValidOtp) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid OTP code.",
      });
    }
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const changedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          email: newEmail,
          emailVerifiedAt: new Date(),
        },
        select: AUTH_USER_SELECT,
      });
      await tx.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      });
      return changedUser;
    });
    return {
      success: true,
      code: AuthMessageCode.EMAIL_CHANGED,
      message: "Email changed successfully.",
      user: updatedUser,
    };
  }
}
