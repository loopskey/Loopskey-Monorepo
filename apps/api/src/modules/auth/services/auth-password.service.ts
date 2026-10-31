import { OtpPurpose, SessionStatus, UserStatus } from "@prisma/client";
import { BadRequestException, Injectable } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { ForgotPasswordInput } from "@auth/dtos/forget-password.input";
import { ChangePasswordInput } from "@auth/dtos/change-password.input";
import { ResetPasswordInput } from "@auth/dtos/reset-password.input";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";

import * as argon2 from "argon2";

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authCommonService: AuthCommonService,
  ) {}

  async forgotPassword(input: ForgotPasswordInput) {
    const email = this.authCommonService.normalizeEmail(input.email);
    const otpCode = this.authCommonService.generateOtpCode();
    const codeHash = await argon2.hash(otpCode);
    const user = await this.prismaService.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, status: true },
    });
    if (user?.status === UserStatus.ACTIVE) {
      const issued = await this.issueResetOtp(user.id, email, codeHash);
      if (issued)
        await this.authCommonService.sendOtpEmail(
          email,
          otpCode,
          OtpPurpose.RESET_PASSWORD,
        );
    }
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_RESET_OTP_SENT,
      message:
        "If an account exists for this email, a password reset code has been sent.",
      user: null,
    };
  }

  private async issueResetOtp(
    userId: string,
    destination: string,
    codeHash: string,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`reset-otp:${userId}`}))`;
      const now = new Date();
      const cooling = await tx.otpCode.findFirst({
        where: {
          userId,
          purpose: OtpPurpose.RESET_PASSWORD,
          consumedAt: null,
          resendAfter: { gt: now },
        },
        select: { id: true },
      });
      if (cooling) return false;
      await tx.otpCode.updateMany({
        where: {
          userId,
          purpose: OtpPurpose.RESET_PASSWORD,
          consumedAt: null,
        },
        data: { consumedAt: now },
      });
      await tx.otpCode.create({
        data: {
          userId,
          destination,
          codeHash,
          purpose: OtpPurpose.RESET_PASSWORD,
          expiresAt: this.authCommonService.getOtpExpiryDate(),
          resendAfter: this.authCommonService.getOtpResendAfterDate(),
          maxAttempts: this.authCommonService.getOtpMaxAttempts(),
        },
      });
      return true;
    });
  }

  private async reserveResetAttempt(userId: string, destination: string) {
    const [reserved] = await this.prismaService.$queryRaw<
      { id: string; codeHash: string }[]
    >`
      UPDATE "OtpCode"
      SET "attempts" = "attempts" + 1
      WHERE "id" = (
        SELECT "id" FROM "OtpCode"
        WHERE "userId" = ${userId}
          AND "destination" = ${destination}
          AND "purpose" = 'RESET_PASSWORD'::"OtpPurpose"
          AND "consumedAt" IS NULL
        ORDER BY "createdAt" DESC
        LIMIT 1
      )
        AND "consumedAt" IS NULL
        AND "attempts" < "maxAttempts"
        AND "expiresAt" > timezone('UTC', now())
      RETURNING "id", "codeHash"`;
    return reserved ?? null;
  }

  private invalidResetCode() {
    return new BadRequestException({
      code: AuthMessageCode.OTP_INVALID,
      message: "Invalid or expired code.",
    });
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = this.authCommonService.normalizeEmail(input.email);
    if (input.newPassword !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    const user = await this.prismaService.user.findFirst({
      where: { email, deletedAt: null, status: UserStatus.ACTIVE },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        fullName: true,
        emailVerifiedAt: true,
      },
    });
    const reserved = user
      ? await this.reserveResetAttempt(user.id, email)
      : null;
    const isValidOtp = await argon2.verify(
      reserved?.codeHash ?? (await this.decoyHash()),
      input.code.trim(),
    );
    if (!user || !reserved || !isValidOtp) throw this.invalidResetCode();
    const passwordHash = await argon2.hash(input.newPassword);
    const now = new Date();
    await this.prismaService.$transaction(async (tx) => {
      const consumed = await tx.otpCode.updateMany({
        where: { id: reserved.id, consumedAt: null },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) throw this.invalidResetCode();
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          forcePasswordChange: false,
          passwordChangedAt: now,
        },
      });
      await tx.authSession.updateMany({
        where: { userId: user.id, status: SessionStatus.ACTIVE },
        data: { status: SessionStatus.REVOKED, revokedAt: now },
      });
    });
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_RESET_SUCCESS,
      message: "Password has been reset successfully.",
      user,
    };
  }

  private decoyHashPromise: Promise<string> | null = null;

  private decoyHash() {
    this.decoyHashPromise ??= argon2.hash("decoy-credential-never-issued");
    return this.decoyHashPromise;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    if (input.newPassword !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "New password and confirm password do not match.",
      });
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
        email: true,
        status: true,
        fullName: true,
        passwordHash: true,
        emailVerifiedAt: true,
        forcePasswordChange: true,
      },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      input.currentPassword,
    );
    if (!isCurrentPasswordValid)
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Current password is incorrect.",
      });
    if (input.newPassword === input.currentPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "New password must be different from the current password.",
      });
    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await argon2.hash(input.newPassword),
        forcePasswordChange: false,
        passwordChangedAt: new Date(),
      },
      select: AUTH_USER_SELECT,
    });
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_CHANGED,
      message: "Password changed successfully.",
      user: updatedUser,
    };
  }
}
