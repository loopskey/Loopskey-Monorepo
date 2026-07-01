import { ConflictException, Injectable } from "@nestjs/common";
import { OtpPurpose, Role, UserStatus } from "@prisma/client";
import { VerifyEmailOtpInput } from "@auth/dtos/verify-email-otp.input";
import { BadRequestException } from "@nestjs/common";
import { ResendEmailOtpInput } from "@auth/dtos/resend-email-otp.input";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { RegisterInput } from "@auth/dtos/register.input";

import * as argon2 from "argon2";

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authCommon: AuthCommonService,
  ) {}

  async register(input: RegisterInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    this.validateRegisterInput(input);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser)
      throw new ConflictException({
        code: AuthMessageCode.USER_ALREADY_EXISTS,
        message: "User already exists.",
      });
    const otpCode = this.authCommon.generateOtpCode();
    const otpCodeHash = await argon2.hash(otpCode);
    const passwordHash = await argon2.hash(input.password);
    await this.prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        fullName: input.fullName.trim(),
        passwordHash,
        role: input.role as Role,
        otpCodeHash,
        otpExpiresAt: this.authCommon.getOtpExpiryDate(),
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        maxAttempts: this.authCommon.getOtpMaxAttempts(),
      },
      update: {
        otpCodeHash,
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        attempts: 0,
        otpExpiresAt: this.authCommon.getOtpExpiryDate(),
        passwordHash,
        role: input.role as Role,
        fullName: input.fullName.trim(),
        maxAttempts: this.authCommon.getOtpMaxAttempts(),
      },
    });
    await this.authCommon.sendOtpEmail(email, otpCode, OtpPurpose.SIGNUP);
    return {
      success: true,
      code: AuthMessageCode.REGISTER_OTP_SENT,
      message: "Verification code has been sent to your email.",
      user: null,
    };
  }

  async verifyEmailOtp(input: VerifyEmailOtpInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    const code = input.code.trim();
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid or expired registration request.",
      });
    if (pending.attempts >= pending.maxAttempts)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_ATTEMPTS_EXCEEDED,
        message: "OTP attempts exceeded.",
      });
    if (pending.otpExpiresAt < new Date())
      throw new BadRequestException({
        code: AuthMessageCode.OTP_EXPIRED,
        message: "OTP has expired.",
      });
    const isValidOtp = await argon2.verify(pending.otpCodeHash, code);
    if (!isValidOtp) {
      await this.prisma.pendingRegistration.update({
        where: { email },
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
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: pending.email,
          fullName: pending.fullName,
          passwordHash: pending.passwordHash,
          role: pending.role,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          professionalProfile:
            pending.role === Role.PROFESSIONAL
              ? {
                  create: {
                    interests: [],
                    skills: [],
                  },
                }
              : undefined,
          providerProfile:
            pending.role === Role.PROVIDER
              ? {
                  create: {},
                }
              : undefined,
        },
        select: AUTH_USER_SELECT,
      });
      await tx.pendingRegistration.delete({
        where: { email },
      });
      return createdUser;
    });
    return {
      success: true,
      code: AuthMessageCode.EMAIL_VERIFIED_AND_USER_CREATED,
      message: "Email verified successfully. User account has been created.",
      user,
    };
  }

  async resendEmailOtp(input: ResendEmailOtpInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Registration request not found.",
      });
    if (pending.resendAfter && pending.resendAfter > new Date())
      throw new BadRequestException({
        code: AuthMessageCode.OTP_RESEND_TOO_SOON,
        message: "Please wait before requesting a new OTP.",
      });
    const otpCode = this.authCommon.generateOtpCode();
    const otpCodeHash = await argon2.hash(otpCode);
    await this.prisma.pendingRegistration.update({
      where: { email },
      data: {
        otpCodeHash,
        otpExpiresAt: this.authCommon.getOtpExpiryDate(),
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        attempts: 0,
      },
    });
    await this.authCommon.sendOtpEmail(email, otpCode, OtpPurpose.SIGNUP);
    return {
      success: true,
      code: AuthMessageCode.REGISTER_OTP_SENT,
      message: "New verification code has been sent to your email.",
      user: null,
    };
  }

  private validateRegisterInput(input: RegisterInput) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    if (
      input.role !== AuthRegisterRole.PROFESSIONAL &&
      input.role !== AuthRegisterRole.PROVIDER
    )
      throw new BadRequestException({
        code: AuthMessageCode.ROLE_NOT_ALLOWED_FOR_REGISTER,
        message: "Only Professional and Provider can register directly.",
      });
  }
}
