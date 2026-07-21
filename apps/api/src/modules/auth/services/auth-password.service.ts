import { OtpPurpose, Role, SessionStatus, UserStatus } from "@prisma/client";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { ForgotPasswordInput } from "@auth/dtos/forget-password.input";
import { ChangePasswordInput } from "@auth/dtos/change-password.input";
import { ResetPasswordInput } from "@auth/dtos/reset-password.input";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { ActivateOrganizationAccountInput } from "@auth/dtos/activate-organization-account.input";
import { createHash } from "crypto";

import * as argon2 from "argon2";

@Injectable()
export class AuthPasswordService {
  private readonly logger = new Logger(AuthPasswordService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly authCommon: AuthCommonService,
  ) {}

  async activateOrganizationAccount(input: ActivateOrganizationAccountInput) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    const codeHash = createHash("sha256").update(input.token).digest("hex");
    const activation = await this.prisma.otpCode.findFirst({
      where: {
        codeHash,
        purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
        consumedAt: null,
      },
      include: {
        user: {
          include: { organizationProfile: true },
        },
      },
    });
    if (
      !activation?.user ||
      activation.user.role !== Role.ORGANIZATION ||
      activation.user.status !== UserStatus.PENDING ||
      !activation.user.organizationProfile
    )
      throw new BadRequestException({
        code: AuthMessageCode.ACTIVATION_TOKEN_INVALID,
        message: "This activation link is invalid or has already been used.",
      });
    if (activation.expiresAt <= new Date())
      throw new BadRequestException({
        code: AuthMessageCode.ACTIVATION_TOKEN_EXPIRED,
        message: "This activation link has expired.",
      });

    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.otpCode.updateMany({
        where: { id: activation.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (consumed.count !== 1)
        throw new BadRequestException({
          code: AuthMessageCode.ACTIVATION_TOKEN_INVALID,
          message: "This activation link has already been used.",
        });
      return tx.user.update({
        where: { id: activation.userId! },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          forcePasswordChange: false,
        },
        select: AUTH_USER_SELECT,
      });
    });

    if (activation.user.email) {
      try {
        await this.authCommon.sendOrganizationPasswordChangedEmail(
          activation.user.email,
          activation.user.organizationProfile?.organizationName ??
            "your Organization",
        );
      } catch (error) {
        this.logger.error("Organization password confirmation email failed", {
          userId: activation.user.id,
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
      }
    }
    return {
      success: true,
      code: AuthMessageCode.ORGANIZATION_ACCOUNT_ACTIVATED,
      message: "Organization account activated successfully.",
      user,
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
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
    const otpCode = this.authCommon.generateOtpCode();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: email,
        codeHash: await argon2.hash(otpCode),
        purpose: OtpPurpose.RESET_PASSWORD,
        expiresAt: this.authCommon.getOtpExpiryDate(),
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        maxAttempts: this.authCommon.getOtpMaxAttempts(),
      },
    });
    await this.authCommon.sendOtpEmail(
      email,
      otpCode,
      OtpPurpose.RESET_PASSWORD,
    );
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_RESET_OTP_SENT,
      message: "Password reset code has been sent to your email.",
      user: null,
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    if (input.newPassword !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        fullName: true,
        emailVerifiedAt: true,
      },
    });
    if (!user)
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        destination: email,
        purpose: OtpPurpose.RESET_PASSWORD,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
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
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid OTP code.",
      });
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await argon2.hash(input.newPassword),
        },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: {
          consumedAt: new Date(),
        },
      }),
      this.prisma.authSession.updateMany({
        where: {
          userId: user.id,
          status: SessionStatus.ACTIVE,
        },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
        },
      }),
    ]);
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_RESET_SUCCESS,
      message: "Password has been reset successfully.",
      user,
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    if (input.newPassword !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "New password and confirm password do not match.",
      });
    const user = await this.prisma.user.findFirst({
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
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await argon2.hash(input.newPassword),
        forcePasswordChange: false,
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
